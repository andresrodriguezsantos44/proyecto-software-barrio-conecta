import { describe, it, expect } from 'bun:test';
import { AppError, globalErrorHandler } from '../error';
import type { Request, Response, NextFunction } from 'express';

/**
 * Helper to create a mock Express response object.
 * Returns the mock and a state tracker for assertions.
 */
function mockResponse() {
  const state = { statusCode: 200, body: {} as Record<string, unknown> };

  const res = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(data: Record<string, unknown>) {
      state.body = data;
      return this;
    },
  } as unknown as Response;

  return { res, state };
}

describe('AppError', () => {
  it('should create an operational error with status "fail" for 4xx codes', () => {
    const error = new AppError(400, 'Bad request');

    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.message).toBe('Bad request');
    expect(error.isOperational).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });

  it('should create an error with status "error" for 5xx codes', () => {
    const error = new AppError(500, 'Server error');

    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.message).toBe('Server error');
  });
});

describe('globalErrorHandler', () => {
  it('should handle AppError with proper status and message', () => {
    const error = new AppError(404, 'Not found');
    const req = {} as Request;
    const { res, state } = mockResponse();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(404);
    expect(state.body).toEqual({
      status: 'fail',
      message: 'Not found',
    });
  });

  it('should return 500 for unknown errors without leaking details', () => {
    const error = new Error('Something internal broke');
    const req = {} as Request;
    const { res, state } = mockResponse();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(500);
    expect(state.body).toEqual({
      status: 'error',
      message: 'Something went wrong',
    });
  });

  it('should handle 401 unauthorized AppError', () => {
    const error = new AppError(401, 'Invalid credentials');
    const req = {} as Request;
    const { res, state } = mockResponse();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(401);
    expect(state.body).toEqual({
      status: 'fail',
      message: 'Invalid credentials',
    });
  });

  it('should handle 403 forbidden AppError', () => {
    const error = new AppError(403, 'Insufficient permissions');
    const req = {} as Request;
    const { res, state } = mockResponse();
    const next = (() => {}) as NextFunction;

    globalErrorHandler(error, req, res, next);

    expect(state.statusCode).toBe(403);
    expect(state.body).toEqual({
      status: 'fail',
      message: 'Insufficient permissions',
    });
  });
});