// ============================================================================
// BarrioConecta — Categories Store
// Pinia store for category list (used in business creation and search).
// ============================================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { categoriesApi } from '@/api';
import type { Category } from '@barrio-conecta/contracts';

export const useCategoriesStore = defineStore('categories', () => {
  // --- State ---
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  async function fetchCategories(): Promise<Category[]> {
    loading.value = true;
    error.value = null;
    try {
      categories.value = await categoriesApi.getCategories();
      return categories.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      error.value = message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    categories,
    loading,
    error,
    // Actions
    fetchCategories,
  };
});