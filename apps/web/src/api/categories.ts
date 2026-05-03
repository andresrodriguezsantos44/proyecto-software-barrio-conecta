// ============================================================================
// BarrioConecta — Categories API Module
// Fetches business categories from the backend for dropdowns and filters.
// ============================================================================

import { api } from './client';
import type { Category } from '@barrio-conecta/contracts';

/** GET /categories — public, no auth required */
export function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories');
}