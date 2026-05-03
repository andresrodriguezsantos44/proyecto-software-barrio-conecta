import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import request from 'supertest';
import { app } from '../app';
import { User } from '../auth/model';
import { generateToken } from '../auth/service';
import { buildTestConfig, resetConfig } from '../shared/config';
import type { UserRole } from '@barrio-conecta/contracts';

/**
 * Integration tests for API routes.
 * These tests exercise the full HTTP stack: route → controller → validation → middleware.
 * Database-dependent operations (MongoDB) are tested via unit tests for the service methods;
 * here we focus on auth guards, validation, 404 fallback, and request/response contracts.
 */

const testConfig = buildTestConfig();

// Helper to generate auth tokens for different roles
function makeToken(userId: string, role: UserRole): string {
  return generateToken(userId, role);
}

// ---------------------------------------------------------------------------
// Health endpoint
// ---------------------------------------------------------------------------
describe('GET /api/v1/health', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------
describe('Auth Routes — POST /api/v1/auth/register', () => {
  let originalFindOne: typeof User.findOne;

  beforeEach(() => {
    originalFindOne = User.findOne;
    process.env.JWT_SECRET = testConfig.jwtSecret;
    resetConfig();
  });

  afterEach(() => {
    User.findOne = originalFindOne;
    delete process.env.JWT_SECRET;
    resetConfig();
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'password123', name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('email');
  });

  it('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: '123', name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password|8/i);
  });

  it('should reject registration with missing name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('should reject empty body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('Auth Routes — POST /api/v1/auth/login', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = testConfig.jwtSecret;
    resetConfig();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    resetConfig();
  });

  it('should reject login with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bad-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('should reject login with missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Business routes — auth guard tests
// ---------------------------------------------------------------------------
describe('Business Routes — Auth Guard', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = testConfig.jwtSecret;
    resetConfig();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    resetConfig();
  });

  it('should return 401 for unauthenticated POST /businesses', async () => {
    const res = await request(app)
      .post('/api/v1/businesses')
      .send({ name: 'Test Biz' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('authorization');
  });

  it('should return 401 for unauthenticated GET /businesses/my', async () => {
    const res = await request(app).get('/api/v1/businesses/my');
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-merchant POST /businesses', async () => {
    const neighborToken = makeToken('neighbor1', 'neighbor');

    const res = await request(app)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${neighborToken}`)
      .send({ name: 'Test Biz' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('permissions');
  });
});

// ---------------------------------------------------------------------------
// Search routes — validation tests
// ---------------------------------------------------------------------------
describe('Search Routes — GET /api/v1/search', () => {
  it('should reject search without lat/lng', async () => {
    const res = await request(app).get('/api/v1/search');
    expect(res.status).toBe(400);
  });

  it('should reject search with invalid radius', async () => {
    const res = await request(app).get('/api/v1/search?lat=4.6&lng=-74.08&radius=999');
    expect(res.status).toBe(400);
  });

  it('should reject search with lat out of range', async () => {
    const res = await request(app).get('/api/v1/search?lat=91&lng=-74.08');
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Review routes — auth guard tests
// ---------------------------------------------------------------------------
describe('Review Routes — Auth Guard', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = testConfig.jwtSecret;
    resetConfig();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    resetConfig();
  });

  it('should return 401 for unauthenticated POST /reviews', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({ businessId: '507f1f77bcf86cd799439011', rating: 5 });

    expect(res.status).toBe(401);
  });

  it('should return 401 for unauthenticated PUT /reviews/:id/reply', async () => {
    const res = await request(app)
      .put('/api/v1/reviews/507f1f77bcf86cd799439011/reply')
      .send({ replyContent: 'Thanks!' });

    expect(res.status).toBe(401);
  });

  it('should return 403 for non-merchant reply', async () => {
    const neighborToken = makeToken('n1', 'neighbor');
    const res = await request(app)
      .put('/api/v1/reviews/507f1f77bcf86cd799439011/reply')
      .set('Authorization', `Bearer ${neighborToken}`)
      .send({ replyContent: 'Thanks!' });

    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Admin routes — auth guard tests
// ---------------------------------------------------------------------------
describe('Admin Routes — Auth Guard', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = testConfig.jwtSecret;
    resetConfig();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    resetConfig();
  });

  it('should return 401 for unauthenticated GET /admin/stats', async () => {
    const res = await request(app).get('/api/v1/admin/stats');
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin GET /admin/stats', async () => {
    const merchantToken = makeToken('m1', 'merchant');
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${merchantToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 403 for neighbor accessing admin reports', async () => {
    const neighborToken = makeToken('n1', 'neighbor');
    const res = await request(app)
      .get('/api/v1/admin/reports')
      .set('Authorization', `Bearer ${neighborToken}`);

    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Admin routes — report creation by any authenticated user
// ---------------------------------------------------------------------------
describe('Admin Routes — POST /admin/reports (any auth user)', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = testConfig.jwtSecret;
    resetConfig();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    resetConfig();
  });

  it('should reject unauthenticated report creation (401)', async () => {
    const res = await request(app)
      .post('/api/v1/admin/reports')
      .send({
        targetType: 'business',
        targetId: '507f1f77bcf86cd799439011',
        reason: 'spam',
      });

    expect(res.status).toBe(401);
  });

  it('should reject invalid report payload (400)', async () => {
    const token = makeToken('u1', 'neighbor');
    const res = await request(app)
      .post('/api/v1/admin/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetType: 'invalid_type',
        targetId: '507f1f77bcf86cd799439011',
        reason: 'spam',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/business.*review/i);
  });
});

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------
describe('API 404 fallback', () => {
  it('should return 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('not found');
  });
});