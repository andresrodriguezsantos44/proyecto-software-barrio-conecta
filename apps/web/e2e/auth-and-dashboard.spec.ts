// ============================================================================
// E2E 1 — Authentication & private route guard
// Registro + login de comerciante → acceso al dashboard;
// ruta privada bloqueada sin token.
// ============================================================================

import { test, expect } from '@playwright/test';
import { registerMerchantViaUI } from './helpers';

test('blocks the merchant dashboard for anonymous visitors', async ({ page }) => {
  await page.goto('/dashboard');
  // The guard redirects to the login screen
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Ingresar' })).toBeVisible();
});

test('registers a merchant and grants access to the dashboard', async ({ page }) => {
  await registerMerchantViaUI(page);

  // After registering, the merchant can open the private dashboard
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Mi Negocio' })).toBeVisible();
});
