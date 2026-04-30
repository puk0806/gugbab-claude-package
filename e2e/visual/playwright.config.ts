import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';

// Playwright 가 .ts config 를 CJS 로 transform 하므로 __dirname 사용 가능.
// outputDir·reporter outputFolder·webServer cwd 가 config 파일 디렉토리(e2e/visual/)
// 기준이 아닌 workspace root 기준이 되도록 절대 경로로 박제한다.
const ROOT = resolve(__dirname, '../..');

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: resolve(ROOT, 'playwright-report') }]]
    : [['list']],
  outputDir: resolve(ROOT, 'test-results'),

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
      cwd: ROOT,
    },
    {
      command: 'pnpm exec http-server apps/storybook-radix/storybook-static --port 6007 --silent',
      url: 'http://127.0.0.1:6007/iframe.html',
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
      cwd: ROOT,
    },
  ],
});
