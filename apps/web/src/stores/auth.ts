// ============================================================================
// BarrioConecta — Auth Store
// Pinia store managing authentication state, token persistence, and login/logout.
// ============================================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api';
import { getStoredToken, getStoredUser, type StoredUser } from '@/api/client';
import type { UserRole, LoginRequest, RegisterRequest } from '@barrio-conecta/contracts';

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(getStoredToken());
  const user = ref<StoredUser | null>(getStoredUser());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed<UserRole | null>(() => user.value?.role ?? null);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isMerchant = computed(() => user.value?.role === 'merchant');

  // --- Actions ---

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      // authApi.login auto-stores token & user via API client
      await authApi.login(credentials);
      // Refresh local state from storage (set by api/auth.ts)
      token.value = getStoredToken();
      user.value = getStoredUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterRequest): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      // authApi.register auto-stores token & user via API client
      await authApi.register(data);
      token.value = getStoredToken();
      user.value = getStoredUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    authApi.logout(); // clears localStorage
    token.value = null;
    user.value = null;
    error.value = null;
  }

  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    token,
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isMerchant,
    // Actions
    login,
    register,
    logout,
    clearError,
  };
});