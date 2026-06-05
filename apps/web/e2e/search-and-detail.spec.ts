// ============================================================================
// E2E 3 — Neighbour searches, filters by category and opens a detail page
// Vecino busca y filtra por categoría → ve el detalle del negocio.
// ============================================================================

import { test, expect } from '@playwright/test';
import { seedBusinessViaApi } from './helpers';

test('a visitor filters by category and opens the business detail', async ({ page, request }) => {
  // Seed a bakery at the SPA's default coordinates (4.60, -74.08) — where it
  // falls back to when geolocation is denied in the headless browser — so the
  // business sits at distance ~0 and is well within the default search radius.
  const business = await seedBusinessViaApi(request, {
    name: `Panadería Barrio ${Date.now()}`,
    categoryName: 'Panadería',
    lat: 4.6,
    lng: -74.08,
  });

  await page.goto('/explore');

  // Filter by the "Panadería" category, then search
  await page.getByRole('button', { name: 'Panadería' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();

  // The seeded business appears in the results
  const card = page.getByText(business.name);
  await expect(card).toBeVisible();

  // Opening it navigates to the detail route and shows the business name
  await card.click();
  await expect(page).toHaveURL(/\/business\//);
  await expect(page.getByRole('heading', { name: business.name })).toBeVisible();
});
