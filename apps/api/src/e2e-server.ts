// ============================================================================
// E2E server bootstrap
// Boots the REAL Express app backed by an in-memory MongoDB and seeds the
// baseline categories. Used by Playwright's webServer so end-to-end runs need
// no external MongoDB — locally or in CI.
// ============================================================================

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from './app';
import { Category } from './businesses/category-model';

const PORT = Number(process.env.PORT) || 3000;

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri();
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'e2e-secret';

await mongoose.connect(mongod.getUri());
// Build indexes (2dsphere geo index is required for search).
await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));

// Seed the category catalogue the SPA dropdown relies on.
await Category.create([
  { name: 'Panadería', icon: '🥖' },
  { name: 'Ferretería', icon: '🔧' },
  { name: 'Cafetería', icon: '☕' },
]);

app.listen(PORT, () => {
  console.log(`🧪 E2E API (in-memory Mongo) running on port ${PORT}`);
});

// Clean up the in-memory server on termination.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  });
}
