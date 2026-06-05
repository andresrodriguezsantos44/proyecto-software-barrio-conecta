// ============================================================================
// Unit: database connection helpers (db.ts)
// Happy path uses a real in-memory MongoDB; the failure path mocks
// mongoose.connect to throw and asserts the process exits with code 1.
// ============================================================================

import { describe, it, expect, afterEach, spyOn } from 'bun:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '../db';
import { resetConfig } from '../config';

describe('db — connectDatabase / disconnectDatabase', () => {
  afterEach(() => {
    resetConfig();
  });

  it('connects to MongoDB and then disconnects (happy path)', async () => {
    const mongod = await MongoMemoryServer.create();
    const originalUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET ??= 'db-test-secret';
    resetConfig();

    const logSpy = spyOn(console, 'log').mockImplementation(() => undefined);

    await connectDatabase();
    expect(mongoose.connection.readyState).toBe(1); // connected

    await disconnectDatabase();
    expect(mongoose.connection.readyState).toBe(0); // disconnected

    logSpy.mockRestore();
    if (originalUri !== undefined) process.env.MONGODB_URI = originalUri;
    else delete process.env.MONGODB_URI;
    await mongod.stop();
  }, 120000);

  it('logs the error and exits with code 1 when the connection fails', async () => {
    process.env.JWT_SECRET ??= 'db-test-secret';
    resetConfig();

    const connectSpy = spyOn(mongoose, 'connect').mockRejectedValue(new Error('boom'));
    const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    await connectDatabase();

    expect(connectSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    connectSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
