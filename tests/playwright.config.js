const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 30_000,
  retries: 1,
  workers: 4,
  outputDir: 'test-results',
  reporter: [
    ['list'],
    // HTML report opens automatically when any test fails; run
    // "npm run test:report" to open it manually at any time.
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
  ],
  use: {
    screenshot: 'on-failure',
    video: 'on-failure',
    trace: 'on-failure',
  },
  projects: [
    {
      name: 'chromium-extension',
      use: { browserName: 'chromium' },
    },
  ],
});
