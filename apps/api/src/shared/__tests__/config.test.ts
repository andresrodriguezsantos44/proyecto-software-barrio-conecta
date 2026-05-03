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
      process.env.JWT_SECRET = 'test-secret-123';
      const cfg = buildConfig();

      expect(cfg.port).toBeGreaterThanOrEqual(1);
      expect(cfg.jwtExpiresIn).toBe('24h');
      expect(cfg.jwtSecret).toBe('test-secret-123');

      // Cleanup
      delete process.env.JWT_SECRET;
    });
  });
});