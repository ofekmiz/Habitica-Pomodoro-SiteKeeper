const { test: base, chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { PopupPage } = require('./pages/PopupPageModel');

const pathToExtension = path.join(__dirname, '..', 'app');

exports.test = base.extend({
  /**
   * Chromium context with the extension loaded via --load-extension.
   * Worker-scoped so the browser is launched ONCE per worker and shared
   * across all tests in that worker (fast).
   */
  extensionContext: [
    async ({}, use) => {
      // launchPersistentContext needs a real directory for video output.
      // We use the same test-results folder Playwright uses for everything else.
      const videoDir = path.join(__dirname, 'test-results', 'videos');
      fs.mkdirSync(videoDir, { recursive: true });

      const ctx = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
          `--disable-extensions-except=${pathToExtension}`,
          `--load-extension=${pathToExtension}`,
        ],
        // Persistent contexts bypass the global use:{} config, so we must
        // configure recording here explicitly.
        recordVideo: { dir: videoDir },
        screenshot: 'on',
      });
      await use(ctx);
      await ctx.close();
    },
    { scope: 'worker' },
  ],

  /**
   * The extension ID assigned dynamically by Chromium, extracted from the
   * service worker URL. Prefer using popupUrl directly in tests.
   */
  extensionId: [
    async ({ extensionContext }, use) => {
      let [background] = extensionContext.serviceWorkers();
      if (!background) {
        background = await extensionContext.waitForEvent('serviceworker');
      }
      const extensionId = background.url().split('/')[2];
      await use(extensionId);
    },
    { scope: 'worker' },
  ],

  /** Full URL of the popup page. Use this in tests instead of building the URL manually. */
  popupUrl: [
    async ({ extensionId }, use) => {
      await use(`chrome-extension://${extensionId}/popup/popup.html`);
    },
    { scope: 'worker' },
  ],

  /**
   * A ready-to-use PopupPage instance backed by a fresh page.
   *
   * Opens the popup, waits for its async initialisation to complete (the
   * "loading" class is removed from <body> once background data is fetched),
   * and closes the page automatically after each test. Tests never need to
   * call openPopup() or page.close() themselves.
   */
  popupPage: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    await use(popupPage);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('failure screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });
    }

    await page.close();
  },

  /**
   * Factory that opens a fresh popup page in the shared extension context.
   * Use this when a test needs more than one popup page (e.g. close-and-reopen
   * scenarios) without importing PopupPage directly.
   *
   * Usage:
   *   const popup = await newPopupPage();
   *   // … test …
   *   await popup.page.close();
   */
  newPopupPage: async ({ extensionContext, popupUrl }, use) => {
    const pages = [];
    await use(async () => {
      const page = await extensionContext.newPage();
      await page.goto(popupUrl);
      const popupPage = new PopupPage(page);
      await popupPage.waitForReady();
      pages.push(page);
      return popupPage;
    });
    for (const page of pages) {
      if (!page.isClosed()) await page.close();
    }
  },
});

exports.expect = base.expect;
