// ============================================================================
// BarrioConecta — Business Store
// Pinia store for current business detail and merchant's businesses.
// ============================================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { businessesApi } from '@/api';
import type { Business, CreateBusinessRequest, UpdateBusinessRequest } from '@barrio-conecta/contracts';

export const useBusinessStore = defineStore('business', () => {
  // --- State ---
  const currentBusiness = ref<Business | null>(null);
  const myBusinesses = ref<Business[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  /** Fetch a single business by ID */
  async function fetchBusiness(id: string): Promise<Business> {
    loading.value = true;
    error.value = null;
    try {
      currentBusiness.value = await businessesApi.getBusinessById(id);
      return currentBusiness.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load business';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Fetch the current merchant's businesses */
  async function fetchMyBusinesses(): Promise<Business[]> {
    loading.value = true;
    error.value = null;
    try {
      myBusinesses.value = await businessesApi.getMyBusinesses();
      return myBusinesses.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load your businesses';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Create a new business (merchant only) */
  async function createBusiness(data: CreateBusinessRequest): Promise<Business> {
    loading.value = true;
    error.value = null;
    try {
      const business = await businessesApi.createBusiness(data);
      myBusinesses.value.push(business);
      return business;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create business';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Update a business (owner or admin) */
  async function updateBusiness(id: string, data: UpdateBusinessRequest): Promise<Business> {
    loading.value = true;
    error.value = null;
    try {
      const updated = await businessesApi.updateBusiness(id, data);
      // Update in local array
      const idx = myBusinesses.value.findIndex((b) => b.id === id);
      if (idx !== -1) {
        myBusinesses.value[idx] = updated;
      }
      if (currentBusiness.value?.id === id) {
        currentBusiness.value = updated;
      }
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update business';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Deactivate a business (logical delete, owner or admin) */
  async function deactivateBusiness(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await businessesApi.deactivateBusiness(id);
      // Remove from local state
      myBusinesses.value = myBusinesses.value.filter((b) => b.id !== id);
      if (currentBusiness.value?.id === id) {
        currentBusiness.value = null;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate business';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrent(): void {
    currentBusiness.value = null;
    error.value = null;
  }

  return {
    // State
    currentBusiness,
    myBusinesses,
    loading,
    error,
    // Actions
    fetchBusiness,
    fetchMyBusinesses,
    createBusiness,
    updateBusiness,
    deactivateBusiness,
    clearCurrent,
  };
});