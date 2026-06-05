// ============================================================================
// E2E helpers — seed data directly through the API so browser scenarios start
// from a known state without driving the UI for setup.
// ============================================================================

import { type APIRequestContext, type Page, expect } from '@playwright/test';

const API = 'http://localhost:3100/api/v1';

/**
 * Register a merchant through the UI and wait until the app finishes the async
 * registration and redirects to the landing page (avoids navigating away before
 * the auth token is persisted).
 */
export async function registerMerchantViaUI(page: Page): Promise<string> {
  const email = uniqueEmail('merchant');
  await page.goto('/register?role=merchant');
  await page.fill('#email', email);
  await page.fill('#password', 'password123');
  await page.fill('#name', 'Comerciante E2E');
  await page.getByRole('button', { name: 'Crear Cuenta' }).click();
  await page.waitForURL((u) => u.pathname === '/');
  return email;
}

/** Unique email per call (the E2E backend keeps state across the run). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@barrio.com`;
}

export async function registerViaApi(
  request: APIRequestContext,
  role: 'merchant' | 'neighbor' | 'admin',
): Promise<{ token: string; userId: string; email: string }> {
  const email = uniqueEmail(role);
  const res = await request.post(`${API}/auth/register`, {
    data: { email, password: 'password123', name: 'E2E User', role },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return { token: body.data.token, userId: body.data.user.id, email };
}

export async function getCategoryId(request: APIRequestContext, name = 'Panadería'): Promise<string> {
  const res = await request.get(`${API}/categories`);
  const body = await res.json();
  const cat = body.data.find((c: { name: string }) => c.name === name);
  expect(cat, `category "${name}" should be seeded`).toBeTruthy();
  return cat.id as string;
}

/** Register a fresh merchant and create one active business via the API. */
export async function seedBusinessViaApi(
  request: APIRequestContext,
  opts: { name: string; categoryName?: string; lat?: number; lng?: number },
): Promise<{ id: string; name: string }> {
  const { token } = await registerViaApi(request, 'merchant');
  const categoryId = await getCategoryId(request, opts.categoryName ?? 'Panadería');
  const res = await request.post(`${API}/businesses`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: opts.name,
      description: 'Sembrado para E2E',
      categoryId,
      location: { type: 'Point', coordinates: [opts.lng ?? -74.0817, opts.lat ?? 4.6097] },
      schedule: {
        mon: { open: '08:00', close: '18:00' },
        tue: { open: '08:00', close: '18:00' },
        wed: { open: '08:00', close: '18:00' },
        thu: { open: '08:00', close: '18:00' },
        fri: { open: '08:00', close: '18:00' },
        sat: { open: '09:00', close: '13:00' },
        sun: { open: '09:00', close: '13:00' },
      },
      photos: [],
    },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).data;
}
