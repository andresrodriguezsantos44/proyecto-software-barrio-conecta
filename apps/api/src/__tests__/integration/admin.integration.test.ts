// ============================================================================
// Integration: Admin panel (real HTTP + real MongoDB)
// AD-01 reports, AD-02 moderation/deactivation, AD-03 stats, AD-04 RBAC.
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

async function seedBusiness() {
  const merchant = await registerUser({ role: 'merchant' });
  const category = await seedCategory();
  const res = await request(app)
    .post('/api/v1/businesses')
    .set(auth(merchant.token))
    .send(businessPayload(category.id));
  return res.body.data.id as string;
}

describe('Integration — Admin', () => {
  it('lets a user report a business and an admin list and review it', async () => {
    const businessId = await seedBusiness();
    const neighbor = await registerUser({ role: 'neighbor' });
    const admin = await registerUser({ role: 'admin' });

    // Neighbor files a report
    const reportRes = await request(app)
      .post('/api/v1/admin/reports')
      .set(auth(neighbor.token))
      .send({ targetType: 'business', targetId: businessId, reason: 'spam', description: 'Contenido sospechoso' });
    expect(reportRes.status).toBe(201);
    expect(reportRes.body.data.status).toBe('NEW');
    const reportId = reportRes.body.data.id;

    // Admin lists reports
    const listRes = await request(app).get('/api/v1/admin/reports').set(auth(admin.token));
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    // Admin moves it to IN_REVIEW
    const patchRes = await request(app)
      .patch(`/api/v1/admin/reports/${reportId}`)
      .set(auth(admin.token))
      .send({ status: 'IN_REVIEW' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('IN_REVIEW');
  });

  it('lets an admin deactivate a business (AD-02)', async () => {
    const businessId = await seedBusiness();
    const admin = await registerUser({ role: 'admin' });

    const res = await request(app)
      .patch(`/api/v1/admin/business/${businessId}/deactivate`)
      .set(auth(admin.token));
    expect(res.status).toBe(200);

    // The business no longer appears publicly
    const byId = await request(app).get(`/api/v1/businesses/${businessId}`);
    expect(byId.status).toBe(404);
  });

  it('returns dashboard stats with counts by role (AD-03)', async () => {
    await seedBusiness(); // creates 1 merchant + 1 active business
    await registerUser({ role: 'neighbor' });
    const admin = await registerUser({ role: 'admin' });

    const res = await request(app).get('/api/v1/admin/stats').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.usersByRole.admin).toBe(1);
    expect(res.body.data.usersByRole.merchant).toBe(1);
    expect(res.body.data.totalBusinesses.active).toBe(1);
  });

  it('forbids a non-admin from accessing admin-only routes (AD-04)', async () => {
    const neighbor = await registerUser({ role: 'neighbor' });
    const res = await request(app).get('/api/v1/admin/stats').set(auth(neighbor.token));
    expect(res.status).toBe(403);
  });
});
