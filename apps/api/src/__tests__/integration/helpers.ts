// ============================================================================
// Integration test harness
// Boots an in-memory MongoDB (mongodb-memory-server), connects Mongoose against
// the REAL Express app, builds indexes (incl. the 2dsphere geo index), and
// exposes seed/auth helpers. Each test file wires connect/clear/disconnect into
// its own beforeAll/afterEach/afterAll hooks.
// ============================================================================

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../app';
import { resetConfig } from '../../shared/config';
import { Category } from '../../businesses/category-model';
import type { CategoryDocument } from '../../businesses/category-model';

export { app, request };

let mongod: MongoMemoryServer | undefined;

/**
 * Start the in-memory MongoDB and connect Mongoose.
 * First run downloads the mongod binary, so callers must allow a long timeout
 * on the beforeAll hook (e.g. `beforeAll(connectTestDB, 120000)`).
 */
export async function connectTestDB(): Promise<void> {
  // The auth layer signs JWTs from config; ensure a secret exists before use.
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'integration-test-secret';
  resetConfig();

  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Build all model indexes (unique email, 2dsphere on Business.location, …).
  // $near queries fail without the geo index, so this is mandatory.
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
}

/** Remove every document from every collection (call in afterEach for isolation). */
export async function clearTestDB(): Promise<void> {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
}

/** Disconnect Mongoose and stop the in-memory server. */
export async function disconnectTestDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  mongod = undefined;
}

// ---------------------------------------------------------------------------
// Seed / auth helpers
// ---------------------------------------------------------------------------

/** Create a Category and return its document (id needed to create businesses). */
export async function seedCategory(name = 'Panadería', icon = '🥖'): Promise<CategoryDocument> {
  return Category.create({ name, icon });
}

export interface RegisteredUser {
  token: string;
  userId: string;
  email: string;
  password: string;
}

let userCounter = 0;

/**
 * Register a user through the real HTTP endpoint and return its token + id.
 * Emails are unique per call so multiple users can coexist within one test
 * (needed for search tests, since BM-02 limits one active business per owner).
 */
export async function registerUser(
  overrides: Partial<{ email: string; password: string; name: string; role: string }> = {},
): Promise<RegisteredUser> {
  userCounter += 1;
  const email = overrides.email ?? `user${userCounter}@barrio.com`;
  const password = overrides.password ?? 'password123';
  const res = await request(app).post('/api/v1/auth/register').send({
    email,
    password,
    name: overrides.name ?? 'Test User',
    role: overrides.role ?? 'neighbor',
  });
  return {
    token: res.body?.data?.token,
    userId: res.body?.data?.user?.id,
    email,
    password,
  };
}

/** A valid 7-day schedule (08:00–18:00) for business creation payloads. */
export const fullSchedule = {
  mon: { open: '08:00', close: '18:00' },
  tue: { open: '08:00', close: '18:00' },
  wed: { open: '08:00', close: '18:00' },
  thu: { open: '08:00', close: '18:00' },
  fri: { open: '08:00', close: '18:00' },
  sat: { open: '09:00', close: '13:00' },
  sun: { open: '09:00', close: '13:00' },
};

/**
 * Build a valid create-business payload. Coordinates are GeoJSON [lng, lat];
 * Bogotá centre by default.
 */
export function businessPayload(
  categoryId: string,
  overrides: Partial<{ name: string; lng: number; lat: number }> = {},
) {
  return {
    name: overrides.name ?? 'Panadería Doña María',
    description: 'La mejor del barrio',
    categoryId,
    location: {
      type: 'Point' as const,
      coordinates: [overrides.lng ?? -74.0817, overrides.lat ?? 4.6097] as [number, number],
    },
    schedule: fullSchedule,
    photos: [],
  };
}
