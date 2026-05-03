// ============================================================================
// BarrioConecta — API Barrel Export
// Re-exports all API modules for clean imports.
// ============================================================================

export { ApiError, getStoredToken, setStoredToken, removeStoredToken, getStoredUser, setStoredUser, removeStoredUser, request, api } from './client';
export type { StoredUser } from './client';
export * as authApi from './auth';
export * as businessesApi from './businesses';
export * as searchApi from './search';
export * as reviewsApi from './reviews';
export * as adminApi from './admin';
export * as categoriesApi from './categories';