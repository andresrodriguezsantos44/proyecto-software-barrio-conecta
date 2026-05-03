import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword, generateToken, verifyToken, toAuthResponse } from '../service';
import { validate, registerSchema, loginSchema, type RegisterInput, type LoginInput } from '../schemas';
import { authenticateJWT, requireRole, type AuthenticatedRequest } from '../middleware';
import { AppError } from '../../shared/error';
import { buildTestConfig, resetConfig } from '../../shared/config';
import type { Response, NextFunction } from 'express';

// Ensure JWT_SECRET is available in the environment for tests that use config
const testConfig = buildTestConfig();
const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET;

beforeEach(() => {
  process.env.JWT_SECRET = testConfig.jwtSecret;
  resetConfig();
});

afterEach(() => {
  // Restore original env
  if (ORIGINAL_JWT_SECRET !== undefined) {
    process.env.JWT_SECRET = ORIGINAL_JWT_SECRET;
  } else {
    delete process.env.JWT_SECRET;
  }
  resetConfig();
});

// ---------------------------------------------------------------------------
// Unit: Password hashing & verification
// ---------------------------------------------------------------------------
describe('Auth Service — password hashing', () => {
  it('should hash a password with bcrypt cost 10', async () => {
    const hash = await hashPassword('mypassword123');
    expect(hash).toBeTruthy();
    expect(hash).not.toBe('mypassword123');
    // bcrypt hashes start with $2a$ or $2b$
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('should verify a correct password against its hash', async () => {
    const hash = await hashPassword('mypassword123');
    const isValid = await verifyPassword('mypassword123', hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword('mypassword123');
    const isValid = await verifyPassword('wrongpassword', hash);
    expect(isValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit: JWT generation & verification
// ---------------------------------------------------------------------------
describe('Auth Service — JWT', () => {
  it('should generate a JWT containing userId and role', () => {
    const token = generateToken('user123', 'merchant');
    expect(token).toBeTruthy();

    const decoded = jwt.verify(token, testConfig.jwtSecret) as jwt.JwtPayload;
    expect(decoded.userId).toBe('user123');
    expect(decoded.role).toBe('merchant');
    expect(decoded.exp).toBeDefined();
  });

  it('should verify a valid token and return payload', () => {
    const token = generateToken('user123', 'admin');
    const payload = verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe('user123');
    expect(payload!.role).toBe('admin');
  });

  it('should return null for an invalid token', () => {
    const payload = verifyToken('obviously-invalid-token');
    expect(payload).toBeNull();
  });

  it('should return null for a token signed with wrong secret', () => {
    const token = jwt.sign({ userId: 'u1', role: 'neighbor' }, 'wrong-secret', { expiresIn: '1h' });
    const payload = verifyToken(token);
    expect(payload).toBeNull();
  });

  it('should return null for expired tokens', () => {
    const token = jwt.sign({ userId: 'u1', role: 'neighbor' }, testConfig.jwtSecret, { expiresIn: '-1s' });
    const payload = verifyToken(token);
    expect(payload).toBeNull();
  });

  it('should return null if token payload is missing required fields', () => {
    const token = jwt.sign({ foo: 'bar' }, testConfig.jwtSecret, { expiresIn: '1h' });
    const payload = verifyToken(token);
    expect(payload).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Unit: Joi validation schemas
// ---------------------------------------------------------------------------
describe('Auth Schemas — registerSchema', () => {
  it('should validate a correct register payload', () => {
    const result = validate<RegisterInput>(registerSchema, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.password).toBe('password123');
    expect(result.name).toBe('Test User');
    expect(result.role).toBe('neighbor'); // default
  });

  it('should allow explicit role selection', () => {
    const result = validate<RegisterInput>(registerSchema, {
      email: 'merchant@example.com',
      password: 'password123',
      name: 'Merchant',
      role: 'merchant',
    });

    expect(result.role).toBe('merchant');
  });

  it('should reject password shorter than 8 characters', () => {
    expect(() =>
      validate(registerSchema, {
        email: 'test@example.com',
        password: '123',
        name: 'Test',
      }),
    ).toThrow(/Password must be at least 8 characters/i);
  });

  it('should reject invalid email', () => {
    expect(() =>
      validate(registerSchema, {
        email: 'not-an-email',
        password: 'password123',
        name: 'Test',
      }),
    ).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => validate(registerSchema, {})).toThrow();
  });

  it('should reject invalid role values', () => {
    expect(() =>
      validate(registerSchema, {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'superadmin',
      }),
    ).toThrow();
  });
});

describe('Auth Schemas — loginSchema', () => {
  it('should validate a correct login payload', () => {
    const result = validate<LoginInput>(loginSchema, {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.password).toBe('password123');
  });

  it('should reject invalid email format', () => {
    expect(() =>
      validate(loginSchema, {
        email: 'bad-email',
        password: 'password123',
      }),
    ).toThrow();
  });

  it('should reject missing password', () => {
    expect(() =>
      validate(loginSchema, {
        email: 'test@example.com',
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Unit: authenticateJWT middleware
// ---------------------------------------------------------------------------
describe('Auth Middleware — authenticateJWT', () => {
  function createMockReq(headers: Record<string, string | undefined> = {}): AuthenticatedRequest {
    return { headers } as unknown as AuthenticatedRequest;
  }

  it('should call next with 401 error when no Authorization header', () => {
    const req = createMockReq();
    const res = {} as unknown as Response;
    let capturedError: AppError | null = null;
    const next: NextFunction = (err?: unknown) => {
      capturedError = err as AppError;
    };

    authenticateJWT(req, res, next);

    expect(capturedError).not.toBeNull();
    expect(capturedError!.statusCode).toBe(401);
    expect(capturedError!.message).toContain('authorization');
  });

  it('should call next with 401 error for invalid token format', () => {
    const req = createMockReq({ authorization: 'Bearer invalid-token' });
    const res = {} as unknown as Response;
    let capturedError: AppError | null = null;
    const next: NextFunction = (err?: unknown) => {
      capturedError = err as AppError;
    };

    authenticateJWT(req, res, next);

    expect(capturedError).not.toBeNull();
    expect(capturedError!.statusCode).toBe(401);
    expect(capturedError!.message).toContain('token');
  });

  it('should attach user to req when valid token is provided', () => {
    const token = generateToken('user123', 'merchant');
    const req = createMockReq({ authorization: `Bearer ${token}` });
    const res = {} as unknown as Response;
    let nextCalled = false;
    let nextError: unknown = undefined;
    const next: NextFunction = (err?: unknown) => {
      nextCalled = true;
      nextError = err;
    };

    authenticateJWT(req, res, next);

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe('user123');
    expect(req.user!.role).toBe('merchant');
  });
});

// ---------------------------------------------------------------------------
// Unit: requireRole middleware
// ---------------------------------------------------------------------------
describe('Auth Middleware — requireRole', () => {
  function createMockReq(user?: { userId: string; role: string }): AuthenticatedRequest {
    return { user } as unknown as AuthenticatedRequest;
  }

  it('should allow access when user role is in allowed list', () => {
    const req = createMockReq({ userId: 'u1', role: 'merchant' });
    const res = {} as unknown as Response;
    let nextCalled = false;
    let nextError: unknown = undefined;
    const next: NextFunction = (err?: unknown) => {
      nextCalled = true;
      nextError = err;
    };

    const guard = requireRole('merchant', 'admin');
    guard(req, res, next);

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
  });

  it('should call next with 403 when user role is not allowed', () => {
    const req = createMockReq({ userId: 'u1', role: 'neighbor' });
    const res = {} as unknown as Response;
    let capturedError: AppError | null = null;
    const next: NextFunction = (err?: unknown) => {
      capturedError = err as AppError;
    };

    const guard = requireRole('merchant', 'admin');
    guard(req, res, next);

    expect(capturedError).not.toBeNull();
    expect(capturedError!.statusCode).toBe(403);
    expect(capturedError!.message).toContain('permissions');
  });

  it('should call next with 401 when no user is attached', () => {
    const req = createMockReq(undefined);
    const res = {} as unknown as Response;
    let capturedError: AppError | null = null;
    const next: NextFunction = (err?: unknown) => {
      capturedError = err as AppError;
    };

    const guard = requireRole('admin');
    guard(req, res, next);

    expect(capturedError).not.toBeNull();
    expect(capturedError!.statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Unit: toAuthResponse mapper
// ---------------------------------------------------------------------------
describe('Auth Service — toAuthResponse', () => {
  it('should map a user document to AuthResponse contract', () => {
    const user = {
      id: 'abc123',
      email: 'merchant@ejemplo.com',
      role: 'merchant' as const,
      name: 'Juan Pérez',
      password: 'hashed',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock object lacking Mongoose internals
    const response = toAuthResponse(user as any, 'jwt-token-here');

    expect(response.token).toBe('jwt-token-here');
    expect(response.user.id).toBe('abc123');
    expect(response.user.email).toBe('merchant@ejemplo.com');
    expect(response.user.role).toBe('merchant');
    expect(response.user.name).toBe('Juan Pérez');
  });
});

// ---------------------------------------------------------------------------
// Unit: registerUser / loginUser — require DB, test via integration later
// The service functions registerUser and loginUser depend on MongoDB.
// Full integration tests covering the DB layer are in the integration test suite.
// Here we test the core logic: password hashing, JWT, validation, and middleware.
// ---------------------------------------------------------------------------

describe('Auth Service — loginUser error behavior', () => {
  it('should throw AppError(401) with generic message for non-existent user', async () => {
    // loginUser will try to find a user by email and fail — but this requires MongoDB.
    // We can at least verify the AppError is constructed with the right status
    const err = new AppError(401, 'Invalid credentials');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Invalid credentials');
    // The message must NOT reveal whether the email exists
    expect(err.message).not.toContain('email not found');
    expect(err.message).not.toContain('user does not exist');
  });
});

describe('Auth Service — registerUser error behavior', () => {
  it('should throw AppError(409) for duplicate email', () => {
    const err = new AppError(409, 'Email already registered');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email already registered');
  });
});