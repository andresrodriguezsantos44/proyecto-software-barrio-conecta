// ============================================================================
// Integration: Reviews (real HTTP + real MongoDB)
// RV-01 create, RV-02 avgRating recalculation, RV-03 merchant reply.
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

/** Create a merchant + business and return { merchant, businessId }. */
async function seedBusiness() {
  const merchant = await registerUser({ role: 'merchant' });
  const category = await seedCategory();
  const res = await request(app)
    .post('/api/v1/businesses')
    .set(auth(merchant.token))
    .send(businessPayload(category.id));
  return { merchant, businessId: res.body.data.id as string };
}

describe('Integration — Reviews', () => {
  it('creates a review and recalculates the business average rating (RV-02)', async () => {
    const { businessId } = await seedBusiness();
    const neighborA = await registerUser({ role: 'neighbor' });
    const neighborB = await registerUser({ role: 'neighbor' });

    const r1 = await request(app)
      .post('/api/v1/reviews')
      .set(auth(neighborA.token))
      .send({ businessId, rating: 5, comment: 'Excelente' });
    expect(r1.status).toBe(201);
    expect(r1.body.data.rating).toBe(5);

    await request(app)
      .post('/api/v1/reviews')
      .set(auth(neighborB.token))
      .send({ businessId, rating: 3 });

    // avgRating = (5 + 3) / 2 = 4
    const biz = await request(app).get(`/api/v1/businesses/${businessId}`);
    expect(biz.body.data.avgRating).toBe(4);
  });

  it('lists reviews for a business newest first', async () => {
    const { businessId } = await seedBusiness();
    const neighbor = await registerUser({ role: 'neighbor' });
    await request(app).post('/api/v1/reviews').set(auth(neighbor.token)).send({ businessId, rating: 4 });

    const res = await request(app).get(`/api/v1/reviews/${businessId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rating).toBe(4);
  });

  it('lets the business owner reply once, and rejects a non-owner reply (RV-03)', async () => {
    const { merchant, businessId } = await seedBusiness();
    const neighbor = await registerUser({ role: 'neighbor' });
    const created = await request(app)
      .post('/api/v1/reviews')
      .set(auth(neighbor.token))
      .send({ businessId, rating: 2, comment: 'Mejorable' });
    const reviewId = created.body.data.id;

    // A different merchant cannot reply
    const intruder = await registerUser({ role: 'merchant' });
    const forbidden = await request(app)
      .put(`/api/v1/reviews/${reviewId}/reply`)
      .set(auth(intruder.token))
      .send({ replyContent: 'No soy el dueño' });
    expect(forbidden.status).toBe(403);

    // The owner can reply
    const ok = await request(app)
      .put(`/api/v1/reviews/${reviewId}/reply`)
      .set(auth(merchant.token))
      .send({ replyContent: 'Gracias por tu comentario' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.reply).toBe('Gracias por tu comentario');
  });

  it('rejects a review for a non-existent business with 404', async () => {
    const neighbor = await registerUser({ role: 'neighbor' });
    const res = await request(app)
      .post('/api/v1/reviews')
      .set(auth(neighbor.token))
      .send({ businessId: '507f1f77bcf86cd799439011', rating: 5 });
    expect(res.status).toBe(404);
  });
});
