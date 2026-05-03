// ============================================================================
// BarrioConecta — Auth API Module
// Login, register, and token management via the API client.
// ============================================================================

import { api, setStoredToken, setStoredUser, removeStoredToken, removeStoredUser } from './client';
import type { AuthResponse, RegisterRequest, LoginRequest } from '@barrio-conecta/contracts';

/** POST /auth/register — creates a user and returns JWT */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  // Auto-store token & user on successful registration
  setStoredToken(response.token);
  setStoredUser(response.user);
  return response;
}

/** POST /auth/login — authenticates and returns JWT */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  // Auto-store token & user on successful login
  setStoredToken(response.token);
  setStoredUser(response.user);
  return response;
}

/** Clear stored auth credentials */
export function logout(): void {
  removeStoredToken();
  removeStoredUser();
}