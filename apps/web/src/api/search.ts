// ============================================================================
// BarrioConecta — Search API Module
// Geospatial business search by category and radius.
// ============================================================================

import { api } from './client';
import type { SearchBusinessesQuery, BusinessSummary, SearchResult } from '@barrio-conecta/contracts';

/** GET /search — geo-search for businesses */
export function searchBusinesses(query: SearchBusinessesQuery): Promise<SearchResult> {
  return api.get<SearchResult>('/search', {
    categoryId: query.categoryId,
    lat: query.lat,
    lng: query.lng,
    radius: query.radius,
    q: query.q,
  });
}

/** Convenience: search returning just the businesses array */
export async function searchBusinessList(query: SearchBusinessesQuery): Promise<BusinessSummary[]> {
  const result = await searchBusinesses(query);
  return result.businesses;
}