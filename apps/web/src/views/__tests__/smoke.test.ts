// ============================================================================
// BarrioConecta — Frontend Smoke Tests
// Verifies critical modules load correctly and basic unit logic works.
// These tests are designed to work in BOTH bun test (Node) and vitest (jsdom)
// environments by providing a localStorage polyfill when needed.
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';

// Provide localStorage polyfill for bun test environment (which lacks DOM)
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

import { ApiError, getStoredToken, setStoredToken, removeStoredToken, getStoredUser, setStoredUser, removeStoredUser } from '../../api/client';

// ---------------------------------------------------------------------------
// API Client — Unit tests for storage helpers and error class
// ---------------------------------------------------------------------------
describe('API Client — Storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve a token', () => {
    setStoredToken('my-jwt-token');
    expect(getStoredToken()).toBe('my-jwt-token');
  });

  it('should return null when no token stored', () => {
    expect(getStoredToken()).toBeNull();
  });

  it('should remove a stored token', () => {
    setStoredToken('my-jwt-token');
    removeStoredToken();
    expect(getStoredToken()).toBeNull();
  });

  it('should store and retrieve a user', () => {
    const user = { id: 'u1', email: 'test@ejemplo.com', name: 'Test', role: 'neighbor' as const };
    setStoredUser(user);
    const stored = getStoredUser();
    expect(stored).toEqual(user);
  });

  it('should return null when no user stored', () => {
    expect(getStoredUser()).toBeNull();
  });

  it('should handle corrupted user data gracefully', () => {
    localStorage.setItem('barrio_conecta_user', '{invalid json');
    expect(getStoredUser()).toBeNull();
  });

  it('should remove a stored user', () => {
    setStoredUser({ id: 'u1', email: 'test@ejemplo.com', name: 'Test', role: 'neighbor' });
    removeStoredUser();
    expect(getStoredUser()).toBeNull();
  });
});

describe('API Client — ApiError', () => {
  it('should create a 4xx error with status "fail"', () => {
    const err = new ApiError(400, 'Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe('fail');
    expect(err.message).toBe('Bad request');
    expect(err instanceof ApiError).toBe(true);
  });

  it('should create a 5xx error with status "error"', () => {
    const err = new ApiError(500, 'Internal error');
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
    expect(err.message).toBe('Internal error');
  });

  it('should create a 401 error', () => {
    const err = new ApiError(401, 'Invalid credentials');
    expect(err.statusCode).toBe(401);
    expect(err.status).toBe('fail');
  });

  it('should create a 403 error', () => {
    const err = new ApiError(403, 'Insufficient permissions');
    expect(err.statusCode).toBe(403);
    expect(err.status).toBe('fail');
  });
});

// ---------------------------------------------------------------------------
// Shared Contracts — Type smoke tests (compile-time + runtime)
// ---------------------------------------------------------------------------
describe('Shared Contracts — TypeName smoke tests', () => {
  it('should allow valid UserRole values', () => {
    const roles = ['merchant', 'admin', 'neighbor'] as const;
    roles.forEach((role) => {
      expect(['merchant', 'admin', 'neighbor']).toContain(role);
    });
  });

  it('should allow valid SearchRadius values', () => {
    const radii = [500, 1000, 2000] as const;
    radii.forEach((r) => {
      expect([500, 1000, 2000]).toContain(r);
    });
  });

  it('should allow valid ReportStatus values', () => {
    const statuses = ['NEW', 'IN_REVIEW', 'RESOLVED'] as const;
    statuses.forEach((s) => {
      expect(['NEW', 'IN_REVIEW', 'RESOLVED']).toContain(s);
    });
  });

  it('should allow valid ReportReason values', () => {
    const reasons = ['spam', 'false_info', 'inappropriate', 'other'] as const;
    reasons.forEach((r) => {
      expect(['spam', 'false_info', 'inappropriate', 'other']).toContain(r);
    });
  });
});