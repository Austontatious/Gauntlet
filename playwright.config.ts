import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web/tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
  },
  webServer: {
    command: 'pnpm --filter web dev --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? 'dev-admin-token',
      UPLOADS_DIR: process.env.UPLOADS_DIR ?? './data/uploads',
      RUNS_DIR: process.env.RUNS_DIR ?? './data/runs',
    },
  },
});
