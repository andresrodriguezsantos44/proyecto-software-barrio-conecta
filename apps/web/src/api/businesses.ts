// ============================================================================
// BarrioConecta — Businesses API Module
// CRUD operations for businesses (merchant context).
// ============================================================================

import { api } from './client';
import type {
  Business,
  CreateBusinessRequest,
  UpdateBusinessRequest,
} from '@barrio-conecta/contracts';

/** POST /businesses — create a new business (merchant only) */
export function createBusiness(data: CreateBusinessRequest): Promise<Business> {
  return api.authPost<Business>('/businesses', data);
}

/** GET /businesses/my — get current merchant's businesses */
export function getMyBusinesses(): Promise<Business[]> {
  return api.authGet<Business[]>('/businesses/my');
}

/** GET /businesses/:id — get a single business by ID (public) */
export function getBusinessById(id: string): Promise<Business> {
  return api.get<Business>(`/businesses/${id}`);
}

/** PUT /businesses/:id — update a business (owner or admin) */
export function updateBusiness(id: string, data: UpdateBusinessRequest): Promise<Business> {
  return api.authPut<Business>(`/businesses/${id}`, data);
}

/** DELETE /businesses/:id — logical deactivation (owner or admin) */
export function deactivateBusiness(id: string): Promise<{ id: string; isActive: boolean }> {
  return api.authDelete<{ id: string; isActive: boolean }>(`/businesses/${id}`);
}