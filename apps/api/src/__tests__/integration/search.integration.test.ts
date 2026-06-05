// ============================================================================
// Integration: Geospatial search (real HTTP + real MongoDB + 2dsphere index)
// GS-01/GS-02: results are filtered by radius/category, exclude inactive
// businesses, and are sorted by proximity (nearest first).
// ============================================================================

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'bun:test';
import {
  app,
  request,
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
  registerUser,
  seedCategory,
  businessPayload,
} from './helpers';

beforeAll(connectTestDB, 120000);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

// Bogotá centre — search origin
const ORIGIN = { lat: 4.6097, lng: -74.0817 };

/** Register a fresh merchant (BM-02: one active business per owner) and create a business. */
async function createBusinessAt(
  categoryId: string,
  coords: { lat: number; lng: number },
  name: string,
): Promise<string> {
  const merchant = await registerUser({ role: 'merchant' });
  const res = await request(app)
    .post('/api/v1/businesses')
    .set(auth(merchant.token))
    .send(businessPayload(categoryId, { name, lat: coords.lat, lng: coords.lng }));
  return res.body.data.id;
}

describe('Integration — Search', () => {
  it('returns active businesses within the radius sorted by proximity', async () => {
    const category = await seedCategory();

    // Near (~0m), mid (~800m NE), far (~1.4km) — all within 2km
    await createBusinessAt(category.id, { lat: 4.6097, lng: -74.0817 }, 'Cercano');
    await createBusinessAt(category.id, { lat: 4.6142, lng: -74.076 }, 'Medio');
    await createBusinessAt(category.id, { lat: 4.62, lng: -74.072 }, 'Lejano');

    const res = await request(app)
      .get('/api/v1/search')
      .query({ lat: ORIGIN.lat, lng: ORIGIN.lng, radius: 2000 });

    expect(res.status).toBe(200);
    const names = res.body.data.businesses.map((b: { name: string }) => b.name);
    expect(names).toHaveLength(3);
    // Sorted nearest-first (GS-02)
    expect(names[0]).toBe('Cercano');
    expect(names[names.length - 1]).toBe('Lejano');
  });

  it('excludes inactive businesses from results', async () => {
    const category = await seedCategory();
    const merchant = await registerUser({ role: 'merchant' });
    const created = await request(app)
      .post('/api/v1/businesses')
      .set(auth(merchant.token))
      .send(businessPayload(category.id, { name: 'Será Desactivado', ...ORIGIN }));
    const id = created.body.data.id;

    // Deactivate it
    await request(app).delete(`/api/v1/businesses/${id}`).set(auth(merchant.token));

    const res = await request(app)
      .get('/api/v1/search')
      .query({ lat: ORIGIN.lat, lng: ORIGIN.lng, radius: 2000 });

    expect(res.status).toBe(200);
    expect(res.body.data.businesses).toHaveLength(0);
  });

  it('filters by category, returning only businesses in that category', async () => {
    const bakery = await seedCategory('Panadería', '🥖');
    const hardware = await seedCategory('Ferretería', '🔧');

    await createBusinessAt(bakery.id, ORIGIN, 'Panadería Central');
    await createBusinessAt(hardware.id, ORIGIN, 'Ferretería El Tornillo');

    const res = await request(app)
      .get('/api/v1/search')
      .query({ lat: ORIGIN.lat, lng: ORIGIN.lng, radius: 2000, categoryId: bakery.id });

    expect(res.status).toBe(200);
    const names = res.body.data.businesses.map((b: { name: string }) => b.name);
    expect(names).toEqual(['Panadería Central']);
  });
});
