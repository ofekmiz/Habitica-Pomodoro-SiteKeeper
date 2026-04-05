/**
 * History fixture — popupPageWithHistory
 *
 * Injects HistoryTestData.json into chrome.storage.sync (key: "Histogram" —
 * the storage area the service worker reads) before the test runs and removes
 * it afterwards for isolation.
 */

const { test: base } = require('../fixtures');
const path = require('path');
const fs   = require('fs');
const { PopupPage } = require('../pages/popupPageModel');

const HISTORY_DATA_PATH = path.join(__dirname, 'data', 'HistoryTestData.json');

/** Raw fixture definitions — consumed by fixtures/index.js for merging. */
const definitions = {
  popupPageWithHistory: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const historyData = JSON.parse(fs.readFileSync(HISTORY_DATA_PATH, 'utf8'));

    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    await page.evaluate((data) => {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ Histogram: data }, resolve);
      });
    }, historyData);

    await page.reload();
    await popupPage.waitForReady();

    await use(popupPage);

    await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.remove('Histogram', resolve);
      });
    });

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
    }

    await page.close();
  },
};

exports.definitions = definitions;
exports.test   = base.extend(definitions);
exports.expect = base.expect;
