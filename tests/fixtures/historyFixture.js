/**
 * History fixture — popupPageWithHistory
 *
 * Injects HistoryTestData.json into chrome.storage.sync (key: "Histogram" —
 * the storage area the service worker reads) before the test runs and removes
 * it afterwards for isolation. Date keys are remapped to a rolling window
 * computed in the browser (see historyDateRemap.js) so they match getDate().
 */

const { test: base } = require('../fixtures');
const path = require('path');
const fs = require('fs');
const { PopupPage } = require('../pages/popupPageModel');
const { remapHistogramToRollingWindow, getBrowserRollingWindowYmds } = require('./historyDateRemap');
const { syncServiceWorkerFromStorage } = require('./userDataStorage');

const HISTORY_DATA_PATH = path.join(__dirname, 'data', 'HistoryTestData.json');

/** @param {import('@playwright/test').Page} page @param {number} [dayCount=21] */
async function loadRemappedHistogramForPage(page, dayCount = 21) {
  const raw = JSON.parse(fs.readFileSync(HISTORY_DATA_PATH, 'utf8'));
  const windowYmds = await getBrowserRollingWindowYmds(page, dayCount);
  return remapHistogramToRollingWindow(raw, windowYmds);
}

/** Raw fixture definitions — consumed by fixtures/index.js for merging. */
const definitions = {
  popupPageWithHistory: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    const historyData = await loadRemappedHistogramForPage(page, 21);

    await page.evaluate((data) => {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ Histogram: data }, resolve);
      });
    }, historyData);
    await syncServiceWorkerFromStorage(page, ['Histogram']);

    await page.reload();
    await popupPage.waitForReady();

    await use(popupPage);

    await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.remove('Histogram', resolve);
      });
    });
    await syncServiceWorkerFromStorage(page, ['Histogram']);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
    }

    await page.close();
  },
};

exports.definitions = definitions;
exports.test = base.extend(definitions);
exports.expect = base.expect;
exports.loadRemappedHistogramForPage = loadRemappedHistogramForPage;
exports.HISTORY_DATA_PATH = HISTORY_DATA_PATH;
