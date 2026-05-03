import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { hashPassword, verifyPassword, generateToken, verifyToken, toAuthResponse } from '../service';
import jwt from 'jsonwebtoken';
import { buildTestConfig, resetConfig } from '../../shared/config';
import { AppError } from '../../shared/error';

const testConfig = buildTestConfig();

beforeEach(() => {
  process.env.JWT_SECRET = testConfig.jwtSecret;
  resetConfig();
});

afterEach(() => {
  delete process.env.JWT_SECRET;
  resetConfig();
});

// ---------------------------------------------------------------------------
// Unit: Password hashing — edge cases
// ---------------------------------------------------------------------------
describe('Auth Service — password hashing (comprehensive)', () => {
  it('should hash different passwords to different hashes', async () => {
    const hash1 = await hashPassword('password1');
    const hash2 = await hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle longer passwords', async () => {
    const longPassword = 'a'.repeat(100);
    const hash = await hashPassword(longPassword);
    expect(hash.startsWith('$2')).toBe(true);
    const isValid = await verifyPassword(longPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should verify password with special characters', async () => {
    const specialPassword = 'p@ssw0rd!#$%^&*()';
    const hash = await hashPassword(specialPassword);
    expect(await verifyPassword(specialPassword, hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit: JWT — additional edge cases
// ---------------------------------------------------------------------------
describe('Auth Service — JWT (comprehensive)', () => {
  it('should include role in token payload', () => {
    const token = generateToken('user1', 'admin');
    const decoded = jwt.verify(token, testConfig.jwtSecret) as jwt.JwtPayload;
    expect(decoded.role).toBe('admin');
  });

  it('should generate different tokens for different users', () => {
    const token1 = generateToken('user1', 'merchant');
    const token2 = generateToken('user2', 'merchant');
    expect(token1).not.toBe(token2);
  });

  it('should verify tokens for all role types', () => {
    for (const role of ['merchant', 'admin', 'neighbor'] as const) {
      const token = generateToken('u1', role);
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.role).toBe(role);
    }
  });

  it('should generate tokens that expire within configured time', () => {
    const token = generateToken('u1', 'neighbor');
    const decoded = jwt.verify(token, testConfig.jwtSecret) as jwt.JwtPayload;
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp! - decoded.iat!).toBeLessThanOrEqual(86400); // 24h max
  });
});

// ---------------------------------------------------------------------------
// Unit: toAuthResponse — additional coverage
// ---------------------------------------------------------------------------
describe('Auth Service — toAuthResponse (comprehensive)', () => {
  it('should map all user fields correctly', () => {
    const user = {
      id: 'abc123',
      email: 'admin@barrioconecta.com',
      role: 'admin' as const,
      name: 'Admin User',
      password: 'hashedpassword',
    };

    const response = toAuthResponse(user as any, 'my-jwt-token');

    expect(response.token).toBe('my-jwt-token');
    expect(response.user.id).toBe('abc123');
    expect(response.user.email).toBe('admin@barrioconecta.com');
    expect(response.user.role).toBe('admin');
    expect(response.user.name).toBe('Admin User');
  });

  it('should include neighbor role in response', () => {
    const user = {
      id: 'n1',
      email: 'vecino@ejemplo.com',
      role: 'neighbor' as const,
      name: 'Pedro Gómez',
      password: 'hash',
    };

    const response = toAuthResponse(user as any, 'neighbor-token');

    expect(response.user.role).toBe('neighbor');
    expect(response.user.email).toBe('vecino@ejemplo.com');
  });
});

// ---------------------------------------------------------------------------
// Unit: Error construction — additional coverage
// ---------------------------------------------------------------------------
describe('Auth Service — error construction (comprehensive)', () => {
  it('should create 409 for duplicate email', () => {
    const err = new AppError(409, 'Email already registered');
    expect(err.statusCode).toBe(409);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('should create 401 for invalid credentials', () => {
    const err = new AppError(401, 'Invalid credentials');
    expect(err.statusCode).toBe(401);
    expect(err.status).toBe('fail');
    expect(err.message).not.toContain('email not found');
    expect(err.message).not.toContain('user does not exist');
    expect(err.message).not.toContain('password');
  });

  it('should create 401 for missing auth header', () => {
    const err = new AppError(401, 'Missing or invalid authorization header');
    expect(err.statusCode).toBe(401);
  });

  it('should create 401 for invalid/expired token', () => {
    const err = new AppError(401, 'Invalid or expired token');
    expect(err.statusCode).toBe(401);
  });

  it('should create 403 for insufficient permissions', () => {
    const err = new AppError(403, 'Insufficient permissions');
    expect(err.statusCode).toBe(403);
  });
});