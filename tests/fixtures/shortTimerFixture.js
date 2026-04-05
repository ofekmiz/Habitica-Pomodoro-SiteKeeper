/**
 * Short-timer fixture — popupPageShortTimer
 *
 * Patches PomoDurationMins=1, BreakDuration=1, LongBreakDuration=1 inside the
 * USER_DATA object in chrome.storage.sync (the storage area the service worker
 * actually reads) so timer-completion tests finish in ~1 minute instead of 25.
 * The original values are restored after the test.
 */

const { test: base } = require('../fixtures');
const { PopupPage } = require('../pages/popupPageModel');

const USER_DATA_KEY = 'USER_DATA';

/** Raw fixture definitions — consumed by fixtures/index.js for merging. */
const definitions = {
  popupPageShortTimer: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    // Read current USER_DATA so we can restore it precisely after the test.
    const originalUserData = await page.evaluate((key) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => resolve(result[key] ?? null));
      });
    }, USER_DATA_KEY);

    // Patch only the three duration fields; preserve everything else.
    await page.evaluate(({ key, patch }) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => {
          const updated = Object.assign({}, result[key] ?? {}, patch);
          chrome.storage.sync.set({ [key]: updated }, resolve);
        });
      });
    }, { key: USER_DATA_KEY, patch: { PomoDurationMins: 1, BreakDuration: 1, LongBreakDuration: 1 } });

    await page.reload();
    await popupPage.waitForReady();

    await use(popupPage);

    // Restore original USER_DATA (or remove the key if it didn't exist before).
    await page.evaluate(({ key, original }) => {
      return new Promise((resolve) => {
        if (original === null) {
          chrome.storage.sync.remove(key, resolve);
        } else {
          chrome.storage.sync.set({ [key]: original }, resolve);
        }
      });
    }, { key: USER_DATA_KEY, original: originalUserData });

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
