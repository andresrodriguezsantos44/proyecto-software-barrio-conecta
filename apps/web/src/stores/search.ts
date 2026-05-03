// ============================================================================
// BarrioConecta — Search Store
// Pinia store managing geospatial search state: query, results, loading.
// ============================================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { searchApi } from '@/api';
import type { SearchBusinessesQuery, BusinessSummary } from '@barrio-conecta/contracts';

export const useSearchStore = defineStore('search', () => {
  // --- State ---
  const query = ref<SearchBusinessesQuery | null>(null);
  const results = ref<BusinessSummary[]>([]);
  const message = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  async function search(searchQuery: SearchBusinessesQuery): Promise<BusinessSummary[]> {
    loading.value = true;
    error.value = null;
    try {
      const result = await searchApi.searchBusinesses(searchQuery);
      query.value = searchQuery;
      results.value = result.businesses;
      message.value = result.message ?? null;
      return result.businesses;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Search failed';
      error.value = message;
      results.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  function clearResults(): void {
    query.value = null;
    results.value = [];
    message.value = null;
    error.value = null;
  }

  return {
    // State
    query,
    results,
    message,
    loading,
    error,
    // Actions
    search,
    clearResults,
  };
});