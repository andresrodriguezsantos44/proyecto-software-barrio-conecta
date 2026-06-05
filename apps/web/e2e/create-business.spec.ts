// ============================================================================
// E2E 2 — Create a business from the merchant panel
// Crear negocio desde el panel → aparece en el listado del comerciante.
// ============================================================================

import { test, expect } from '@playwright/test';
import { registerMerchantViaUI } from './helpers';

test('a merchant creates a business and sees it listed', async ({ page }) => {
  const businessName = `Panadería ${Date.now()}`;

  await registerMerchantViaUI(page);

  // Open the dashboard and the create form
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: 'Registrar Negocio', exact: true }).click();

  // Fill the form (lat/lng and schedule come pre-filled with sensible defaults)
  await page.fill('#biz-name', businessName);
  await page.selectOption('#biz-category', { index: 1 }); // first real category
  await page.getByRole('button', { name: 'Crear Negocio' }).click();

  // The new business shows up in the merchant's list with an "Activo" badge
  await expect(page.getByRole('heading', { name: businessName })).toBeVisible();
  await expect(page.getByText('Activo')).toBeVisible();
});
