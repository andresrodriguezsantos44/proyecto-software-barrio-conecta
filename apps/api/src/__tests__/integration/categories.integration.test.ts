// ============================================================================
// Integration: Categories (real HTTP + real MongoDB)
// Public listing used by the frontend category dropdown.
// ============================================================================

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'bun:test';
import { app, request, connectTestDB, clearTestDB, disconnectTestDB, seedCategory } from './helpers';

beforeAll(connectTestDB, 120000);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

describe('Integration — Categories', () => {
  it('returns an empty list when there are no categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns all seeded categories with id, name and icon', async () => {
    await seedCategory('Panadería', '🥖');
    await seedCategory('Ferretería', '🔧');

    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    const names = res.body.data.map((c: { name: string }) => c.name).sort();
    expect(names).toEqual(['Ferretería', 'Panadería']);
    expect(res.body.data[0]).toHaveProperty('icon');
  });
});
