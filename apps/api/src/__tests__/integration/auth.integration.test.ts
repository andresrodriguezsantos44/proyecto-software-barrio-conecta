// ============================================================================
// Integration: Auth flow (real HTTP + real MongoDB)
// Exercises route → controller → validation → service → Mongoose → DB.
// ============================================================================

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'bun:test';
import jwt from 'jsonwebtoken';
import { app, request, connectTestDB, clearTestDB, disconnectTestDB } from './helpers';

beforeAll(connectTestDB, 120000);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe('Integration — Auth', () => {
  it('registers a merchant and then logs in, returning a valid JWT', async () => {
    // 1) Register
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      email: 'maria@barrio.com',
      password: 'password123',
      name: 'María Comerciante',
      role: 'merchant',
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.status).toBe('success');
    expect(registerRes.body.data.token).toBeTruthy();
    expect(registerRes.body.data.user.email).toBe('maria@barrio.com');
    expect(registerRes.body.data.user.role).toBe('merchant');
    // Password hash must never be exposed
    expect(registerRes.body.data.user.password).toBeUndefined();

    // 2) Login with the same credentials
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'maria@barrio.com',
      password: 'password123',
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeTruthy();

    // 3) The JWT decodes to the right user and role
    const decoded = jwt.verify(
      loginRes.body.data.token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    expect(decoded.userId).toBe(loginRes.body.data.user.id);
    expect(decoded.role).toBe('merchant');
  });

  it('rejects a duplicate email with 409', async () => {
    const body = { email: 'dup@barrio.com', password: 'password123', name: 'Dup', role: 'neighbor' };
    await request(app).post('/api/v1/auth/register').send(body);

    const second = await request(app).post('/api/v1/auth/register').send(body);
    expect(second.status).toBe(409);
    expect(second.body.status).toBe('fail');
  });

  it('rejects login with a wrong password using a generic 401', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'wrongpass@barrio.com',
      password: 'password123',
      name: 'User',
      role: 'neighbor',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'wrongpass@barrio.com',
      password: 'totally-wrong',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('rejects registration with an invalid payload (short password) with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'short@barrio.com',
      password: '123',
      name: 'User',
      role: 'neighbor',
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});
