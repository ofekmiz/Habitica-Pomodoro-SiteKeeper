const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.js', '**/*.spec.ts'],
  retries: 1,
  workers: 4,
  // Global per-test timeout.
  timeout: 360_000,
  outputDir: 'test-results',
  reporter: [
    ['list'],
    // HTML report opens automatically when any test fails; run
    // "npm run test:report" to open it manually at any time.
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
  ],
  expect: {
    timeout: 10_000,
  },
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
    screenshot: 'on-failure',
    video: 'on-failure',
    trace: 'on-failure',
  },
  fullyParallel: true,

  projects: [
    {
      name: 'chromium-extension',
      use: { browserName: 'chromium' },
    },
  ],
});
