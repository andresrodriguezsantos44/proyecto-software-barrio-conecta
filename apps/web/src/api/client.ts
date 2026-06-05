// ============================================================================
// BarrioConecta — API Client
// Typed fetch wrapper handling Authorization header, base URL, and error mapping.
// ============================================================================

import type { UserRole } from '@barrio-conecta/contracts';

// --- Configuration ---

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

// --- Error types ---

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// --- Auth token management ---

const TOKEN_KEY = 'barrio_conecta_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// --- User storage for quick access without decode ---

const USER_KEY = 'barrio_conecta_user';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// --- Request helpers ---

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  auth?: boolean;
}

/**
 * Typed fetch wrapper that:
 * - Prepends BASE_URL
 * - Serializes body as JSON
 * - Appends query params from `params`
 * - Adds Authorization header when token is present or `auth: true`
 * - Maps non-2xx responses to ApiError
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = false } = options;

  // Build URL with query params
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (auth || token) {
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Execute request
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  // API convention: { status: 'success', data: T }
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

/** Convenience methods */
export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  /** Authenticated variants — same as above but with auth flag set */
  authGet: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(path, { method: 'GET', params, auth: true }),

  authPost: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body, auth: true }),

  authPut: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body, auth: true }),

  authPatch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body, auth: true }),

  authDelete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE', auth: true }),
};