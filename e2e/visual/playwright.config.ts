import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  outputDir: 'test-results',

  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}-{platform}{ext}',

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.001,
    },
  },

  use: {
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'mui',
      testMatch: /mui\.spec\.ts$/,
      use: { baseURL: 'http://127.0.0.1:6006' },
    },
    {
      name: 'radix',
      testMatch: /radix\.spec\.ts$/,
      use: { baseURL: 'http://127.0.0.1:6007' },
    },
  ],

  webServer: [
    {
      command: 'pnpm exec http-server apps/storybook-mui/storybook-static --port 6006 --silent',
      url: 'http://127.0.0.1:6006/iframe.html',
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
    },
    {
      command: 'pnpm exec http-server apps/storybook-radix/storybook-static --port 6007 --silent',
      url: 'http://127.0.0.1:6007/iframe.html',
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
    },
  ],
});
