import { defineConfig, devices } from '@playwright/test';

// ============================================================================
// Playwright E2E configuration
// Boots two servers: the API backed by an in-memory MongoDB (port 3100) and the
// Vite dev server (port 4321) pointed at it. No external services required.
// ============================================================================

const API_PORT = 3100;
const WEB_PORT = 4321;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  // The backend keeps state across tests (single in-memory DB), so run serially.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    headless: true,
    trace: 'on-first-retry',
    // Deny geolocation so the SPA deterministically falls back to default coords.
    permissions: [],
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command: `bun run --cwd ../api e2e:server`,
      port: API_PORT,
      timeout: 120_000,
      reuseExistingServer: false,
      env: { PORT: String(API_PORT), JWT_SECRET: 'e2e-secret' },
    },
    {
      // The SPA calls the API same-origin; Vite proxies /api → the E2E backend.
      command: `bunx --bun vite --port ${WEB_PORT} --strictPort`,
      port: WEB_PORT,
      timeout: 120_000,
      reuseExistingServer: false,
      env: { VITE_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});
