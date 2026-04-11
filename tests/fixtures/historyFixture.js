/**
 * History fixture — popupPageWithHistory
 *
 * Injects HistoryTestData.json into chrome.storage.sync (key: "Histogram" —
 * the storage area the service worker reads) before the test runs and removes
 * it afterwards for isolation. Date keys are remapped to a rolling window
 * computed in the browser (see historyDateRemap.js) so they match getDate().
 */

const path = require('path');
const fs = require('fs');
const { PopupPage } = require('../pages/popupPageModel');
const { remapHistogramToRollingWindow, getBrowserRollingWindowYmds } = require('./historyDateRemap');
const { syncServiceWorkerFromStorage } = require('./userDataStorage');
const { attachFailureScreenshot } = require('../utils/testHelpers');

const HISTORY_DATA_PATH = path.join(__dirname, 'data', 'HistoryTestData.json');

/** Rolling window length (days) for remapped histogram keys; matches chart navigation range in tests. */
const DEFAULT_HISTOGRAM_WINDOW_DAYS = 21;

const RAW_HISTOGRAM_FIXTURE = JSON.parse(fs.readFileSync(HISTORY_DATA_PATH, 'utf8'));

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} [dayCount] Rolling window in days; defaults to `DEFAULT_HISTOGRAM_WINDOW_DAYS`.
 */
async function loadRemappedHistogramForPage(page, dayCount = DEFAULT_HISTOGRAM_WINDOW_DAYS) {
  const windowYmds = await getBrowserRollingWindowYmds(page, dayCount);
  return remapHistogramToRollingWindow(RAW_HISTOGRAM_FIXTURE, windowYmds);
}

/** Raw fixture definitions — consumed by fixtures/index.js for merging. */
const definitions = {
  popupPageWithHistory: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    try {
      // Setup: open popup and prepare page
      await page.goto(popupUrl);
      const popupPage = new PopupPage(page);
      await popupPage.waitForReady();

      // Inject remapped histogram → extension storage → service worker
      const historyData = await loadRemappedHistogramForPage(page, DEFAULT_HISTOGRAM_WINDOW_DAYS);

      await page.evaluate((data) => {
        return new Promise((resolve) => {
          chrome.storage.sync.set({ Histogram: data }, resolve);
        });
      }, historyData);
      await syncServiceWorkerFromStorage(page, ['Histogram']);

      // Reload: sync updates the service worker only; popup `Vars` was set on first load via
      // getBackgroundData() and would stay stale until the page loads again (see communication.js).
      await page.reload();
      await popupPage.waitForReady();

      await use(popupPage);
    } finally {
      // Teardown: screenshot (best-effort), then always clear storage and close page for isolation
      try {
        await attachFailureScreenshot(page, testInfo);
      } catch {
        // Do not skip storage cleanup if screenshot fails
      }
      try {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            chrome.storage.sync.remove('Histogram', resolve);
          });
        });
        await syncServiceWorkerFromStorage(page, ['Histogram']);
      } catch {
        // Page or storage may be unavailable if setup failed early
      }
      await page.close().catch(() => {});
    }
  },
};

exports.definitions = definitions;
exports.loadRemappedHistogramForPage = loadRemappedHistogramForPage;
