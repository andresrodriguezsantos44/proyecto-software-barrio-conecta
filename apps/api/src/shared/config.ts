/**
 * Application configuration loaded from environment variables.
 * Values are evaluated lazily so the module can be safely imported
 * in tests that don't set all env vars — call `buildConfig()` explicitly
 * or use `buildTestConfig()` in test suites.
 */

export interface Config {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Build config from current environment. Throws if required vars are missing.
 */
export function buildConfig(): Config {
  return {
    port: Number(getEnv('PORT', '3000')),
    mongoUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/barrio-conecta'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '24h'),
  };
}

/**
 * Build a test-safe config with sensible defaults.
 * Does NOT read from environment — safe for unit tests.
 */
export function buildTestConfig(overrides?: Partial<Config>): Config {
  return {
    port: 3000,
    mongoUri: 'mongodb://localhost:27017/barrio-conecta-test',
    jwtSecret: 'test-secret-not-for-production',
    jwtExpiresIn: '1h',
    ...overrides,
  };
}

/**
 * Lazy config that only evaluates when first accessed.
 * Safe to import in tests — won't throw until you actually read a property.
 */
let _cachedConfig: Config | null = null;

export const config: Config = new Proxy({} as Config, {
  get(_target, prop: keyof Config) {
    if (!_cachedConfig) {
      _cachedConfig = buildConfig();
    }
    return _cachedConfig[prop];
  },
});

/**
 * Reset the config cache. Useful in tests when environment variables change
 * between test cases and you need config to re-evaluate.
 */
export function resetConfig(): void {
  _cachedConfig = null;
}