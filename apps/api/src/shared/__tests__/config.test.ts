import { describe, it, expect } from 'bun:test';
import { buildTestConfig, buildConfig } from '../config';

describe('Config', () => {
  describe('buildTestConfig', () => {
    it('should return sensible defaults', () => {
      const cfg = buildTestConfig();

      expect(cfg.port).toBe(3000);
      expect(cfg.mongoUri).toContain('mongodb');
      expect(cfg.jwtSecret).toBeTruthy();
      expect(cfg.jwtExpiresIn).toBe('1h');
    });

    it('should allow overriding individual fields', () => {
      const cfg = buildTestConfig({ port: 4000, jwtSecret: 'custom-secret' });

      expect(cfg.port).toBe(4000);
      expect(cfg.jwtSecret).toBe('custom-secret');
      expect(cfg.jwtExpiresIn).toBe('1h'); // unchanged default
    });
  });

  describe('buildConfig', () => {
    it('should throw when JWT_SECRET is missing from environment', () => {
      // Ensure JWT_SECRET is not set
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => buildConfig()).toThrow('Missing required environment variable: JWT_SECRET');

      // Restore
      if (original) process.env.JWT_SECRET = original;
    });

    it('should use defaults for optional env vars', () => {
      // Snapshot the optional vars so the assertion holds regardless of the
      // ambient environment (CI may export JWT_EXPIRES_IN / PORT).
      const original = {
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        PORT: process.env.PORT,
      };
      process.env.JWT_SECRET = 'test-secret-123';
      delete process.env.JWT_EXPIRES_IN;
      delete process.env.PORT;

      const cfg = buildConfig();

      expect(cfg.port).toBe(3000);
      expect(cfg.jwtExpiresIn).toBe('24h');
      expect(cfg.jwtSecret).toBe('test-secret-123');

      // Restore
      delete process.env.JWT_SECRET;
      if (original.JWT_EXPIRES_IN !== undefined) process.env.JWT_EXPIRES_IN = original.JWT_EXPIRES_IN;
      if (original.PORT !== undefined) process.env.PORT = original.PORT;
    });
  });
});