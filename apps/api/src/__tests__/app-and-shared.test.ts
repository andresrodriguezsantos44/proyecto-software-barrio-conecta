import { describe, it, expect } from 'bun:test';
import { app } from '../app';
import { AppError, globalErrorHandler } from '../shared/error';
import { buildConfig, buildTestConfig, resetConfig } from '../shared/config';
import type { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Unit: Config — buildConfig vs buildTestConfig
// ---------------------------------------------------------------------------
describe('Config — comprehensive', () => {
  it('should return test config defaults', () => {
    const cfg = buildTestConfig();
    expect(cfg.port).toBe(3000);
    expect(cfg.mongoUri).toContain('mongodb');
    expect(cfg.mongoUri).toContain('test');
    expect(cfg.jwtSecret).toBeTruthy();
    expect(cfg.jwtExpiresIn).toBe('1h');
  });

  it('should allow full override of test config', () => {
    const cfg = buildTestConfig({
      port: 8080,
      mongoUri: 'mongodb://custom:27017/db',
      jwtSecret: 'super-secret',
      jwtExpiresIn: '2h',
    });
    expect(cfg.port).toBe(8080);
    expect(cfg.mongoUri).toBe('mongodb://custom:27017/db');
    expect(cfg.jwtSecret).toBe('super-secret');
    expect(cfg.jwtExpiresIn).toBe('2h');
  });

  it('should throw for missing JWT_SECRET in buildConfig', () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => buildConfig()).toThrow('JWT_SECRET');
    if (original) process.env.JWT_SECRET = original;
  });

  it('should use provided env vars in buildConfig', () => {
    process.env.JWT_SECRET = 'my-prod-secret';
    process.env.PORT = '4000';
    process.env.MONGODB_URI = 'mongodb://prod:27017/barrio';
    const cfg = buildConfig();

    expect(cfg.jwtSecret).toBe('my-prod-secret');
    expect(cfg.port).toBe(4000);
    expect(cfg.mongoUri).toBe('mongodb://prod:27017/barrio');

    // Cleanup
    delete process.env.JWT_SECRET;
    delete process.env.PORT;
    delete process.env.MONGODB_URI;
    resetConfig();
  });

  it('should use default MONGODB_URI and PORT when not set', () => {
    // Snapshot so the test is hermetic regardless of the ambient environment
    // (e.g. CI may export these — defaults can only be asserted when unset).
    const original = {
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      MONGODB_URI: process.env.MONGODB_URI,
      PORT: process.env.PORT,
    };
    process.env.JWT_SECRET = 'test';
    delete process.env.MONGODB_URI;
    delete process.env.PORT;
    delete process.env.JWT_EXPIRES_IN;
    const cfg = buildConfig();

    expect(cfg.mongoUri).toBe('mongodb://localhost:27017/barrio-conecta');
    expect(cfg.jwtExpiresIn).toBe('24h');

    // Restore
    delete process.env.JWT_SECRET;
    if (original.JWT_EXPIRES_IN !== undefined) process.env.JWT_EXPIRES_IN = original.JWT_EXPIRES_IN;
    if (original.MONGODB_URI !== undefined) process.env.MONGODB_URI = original.MONGODB_URI;
    if (original.PORT !== undefined) process.env.PORT = original.PORT;
    resetConfig();
  });
});

// ---------------------------------------------------------------------------
// Unit: AppError — comprehensive coverage
// ---------------------------------------------------------------------------
describe('AppError — comprehensive', () => {
  it('should set isOperational to true', () => {
    const err = new AppError(400, 'Bad request');
    expect(err.isOperational).toBe(true);
  });

  it('should set status to "fail" for all 4xx codes', () => {
    for (const code of [400, 401, 403, 404, 409, 422]) {
      const err = new AppError(code, `Error ${code}`);
      expect(err.status).toBe('fail');
      expect(err.statusCode).toBe(code);
    }
  });

  it('should set status to "error" for 5xx codes', () => {
    for (const code of [500, 502, 503]) {
      const err = new AppError(code, `Error ${code}`);
      expect(err.status).toBe('error');
      expect(err.statusCode).toBe(code);
    }
  });

  it('should be an instance of Error', () => {
    const err = new AppError(400, 'Test');
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
    expect(err.message).toBe('Test');
  });

  it('should set prototype correctly for instanceof check', () => {
    const err = new AppError(404, 'Not found');
    expect(err instanceof AppError).toBe(true);
    expect(Object.getPrototypeOf(err)).toBe(AppError.prototype);
  });
});

// ---------------------------------------------------------------------------
// Unit: globalErrorHandler — comprehensive
// ---------------------------------------------------------------------------
describe('globalErrorHandler — comprehensive', () => {
  function mockRes() {
    const state = { statusCode: 200, body: {} as Record<string, unknown> };
    const res = {
      status(code: number) { state.statusCode = code; return this; },
      json(data: Record<string, unknown>) { state.body = data; return this; },
    } as unknown as Response;
    return { res, state };
  }

  it('should handle 400 AppError', () => {
    const error = new AppError(400, 'Validation failed');
    const req = {} as Request;
    const { res, state } = mockRes();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(400);
    expect(state.body.status).toBe('fail');
    expect(state.body.message).toBe('Validation failed');
  });

  it('should handle 422 AppError', () => {
    const error = new AppError(422, 'Unprocessable');
    const req = {} as Request;
    const { res, state } = mockRes();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(422);
    expect(state.body).toEqual({ status: 'fail', message: 'Unprocessable' });
  });

  it('should handle 409 conflict', () => {
    const error = new AppError(409, 'Conflict');
    const req = {} as Request;
    const { res, state } = mockRes();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(409);
    expect(state.body).toEqual({ status: 'fail', message: 'Conflict' });
  });

  it('should handle 500 AppError', () => {
    const error = new AppError(500, 'Internal server error');
    const req = {} as Request;
    const { res, state } = mockRes();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(500);
    expect(state.body).toEqual({ status: 'error', message: 'Internal server error' });
  });
});

// ---------------------------------------------------------------------------
// Integration: App health endpoint
// ---------------------------------------------------------------------------
import request from 'supertest';

describe('App — health endpoint', () => {
  it('GET /api/v1/health should return ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeTruthy();
  });

  it('GET /api/v1/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('not found');
  });
});