// ============================================================================
// Integration: Business management (real HTTP + real MongoDB)
// Covers create (RBAC + BM-02), persistence, retrieval, update and logical
// deletion across controller → service → Mongoose.
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

describe('Integration — Businesses', () => {
  it('persists a business created by a merchant and exposes it in listings', async () => {
    const merchant = await registerUser({ role: 'merchant' });
    const category = await seedCategory();

    // Create
    const createRes = await request(app)
      .post('/api/v1/businesses')
      .set(auth(merchant.token))
      .send(businessPayload(category.id));

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.id).toBeTruthy();
    expect(createRes.body.data.categoryId).toBe(category.id);
    const businessId = createRes.body.data.id;

    // Appears in the merchant's own listing
    const myRes = await request(app).get('/api/v1/businesses/my').set(auth(merchant.token));
    expect(myRes.status).toBe(200);
    expect(myRes.body.data).toHaveLength(1);
    expect(myRes.body.data[0].id).toBe(businessId);

    // Retrievable by id (public)
    const byIdRes = await request(app).get(`/api/v1/businesses/${businessId}`);
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.data.name).toBe('Panadería Doña María');
  });

  it('enforces BM-02: a merchant may not own two active businesses (409)', async () => {
    const merchant = await registerUser({ role: 'merchant' });
    const category = await seedCategory();

    await request(app).post('/api/v1/businesses').set(auth(merchant.token)).send(businessPayload(category.id));
    const second = await request(app)
      .post('/api/v1/businesses')
      .set(auth(merchant.token))
      .send(businessPayload(category.id, { name: 'Segundo Local' }));

    expect(second.status).toBe(409);
  });

  it('rejects creation without a token (401)', async () => {
    const category = await seedCategory();
    const res = await request(app).post('/api/v1/businesses').send(businessPayload(category.id));
    expect(res.status).toBe(401);
  });

  it('rejects creation by a non-merchant role (403)', async () => {
    const neighbor = await registerUser({ role: 'neighbor' });
    const category = await seedCategory();
    const res = await request(app)
      .post('/api/v1/businesses')
      .set(auth(neighbor.token))
      .send(businessPayload(category.id));
    expect(res.status).toBe(403);
  });

  it('updates and then logically deletes a business (BM-03)', async () => {
    const merchant = await registerUser({ role: 'merchant' });
    const category = await seedCategory();
    const created = await request(app)
      .post('/api/v1/businesses')
      .set(auth(merchant.token))
      .send(businessPayload(category.id));
    const id = created.body.data.id;

    // Update the name
    const updateRes = await request(app)
      .put(`/api/v1/businesses/${id}`)
      .set(auth(merchant.token))
      .send({ name: 'Nombre Actualizado' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Nombre Actualizado');

    // Deactivate (logical delete)
    const delRes = await request(app).delete(`/api/v1/businesses/${id}`).set(auth(merchant.token));
    expect(delRes.status).toBe(200);
    expect(delRes.body.data.isActive).toBe(false);

    // A deactivated business is no longer publicly retrievable (404)
    const afterRes = await request(app).get(`/api/v1/businesses/${id}`);
    expect(afterRes.status).toBe(404);
  });
});
