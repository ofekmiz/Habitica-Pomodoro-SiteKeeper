/**
 * Short-timer fixture — popupPageShortTimer
 *
 * Patches PomoDurationMins=1, BreakDuration=1, LongBreakDuration=1, ManualBreak=false
 * inside USER_DATA in chrome.storage.sync so timer tests reach automatic break (tomatoBreak)
 * in ~1 minute. The original values are restored after the test.
 */

const { test: base } = require('../fixtures');
const { PopupPage } = require('../pages/popupPageModel');
const {
  HOST_OFEX,
  OFEX_DEMO_URL,
  HOST_LOCALHOST,
  LOCALHOST_URL,
} = require('../constants/testConstants');
const { syncServiceWorkerFromStorage } = require('./userDataStorage');

const USER_DATA_KEY = 'USER_DATA';

const OFEX_BLOCKED = { hostname: HOST_OFEX, cost: 0, passDuration: 30 };
const LOCALHOST_BLOCKED = { hostname: HOST_LOCALHOST, cost: 0, passDuration: 30 };

/** Merged into USER_DATA for all short-timer scenarios (service worker + popup). */
const SHORT_TIMER_USER_DATA_PATCH = {
  PomoDurationMins: 1,
  BreakDuration: 1,
  LongBreakDuration: 1,
  ManualBreak: false,
};

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<object|null>} previous USER_DATA for restore
 */
async function readUserDataSnapshot(page) {
  return page.evaluate((key) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => resolve(result[key] ?? null));
    });
  }, USER_DATA_KEY);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {object|null} original
 */
async function restoreUserDataSnapshot(page, original) {
  await page.evaluate(({ key, original: orig }) => {
    return new Promise((resolve) => {
      if (orig === null) {
        chrome.storage.sync.remove(key, resolve);
      } else {
        chrome.storage.sync.set({ [key]: orig }, resolve);
      }
    });
  }, { key: USER_DATA_KEY, original });
}

/**
 * Apply short timer + optional blocked host, sync SW, reload `page`.
 * @returns {Promise<object|null>} snapshot to pass to restoreUserDataSnapshot
 */
async function applyShortTimerPatch(page, hostname, siteData) {
  const originalUserData = await readUserDataSnapshot(page);
  await page.evaluate(({ key, patch, hostname: host, site }) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        const updated = Object.assign({}, result[key] ?? {}, patch);
        if (host && site) {
          updated.BlockedSites = Object.assign({}, updated.BlockedSites ?? {}, { [host]: site });
        }
        chrome.storage.sync.set({ [key]: updated }, resolve);
      });
    });
  }, {
    key: USER_DATA_KEY,
    patch: SHORT_TIMER_USER_DATA_PATCH,
    hostname: hostname ?? null,
    site: siteData ?? null,
  });
  await syncServiceWorkerFromStorage(page, ['USER_DATA']);
  await page.reload();
  return originalUserData;
}

/** Raw fixture definitions — consumed by fixtures/index.js for merging. */
const definitions = {
  popupPageShortTimer: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    const originalUserData = await applyShortTimerPatch(page, null, null);
    await popupPage.waitForReady();

    await use(popupPage);

    await restoreUserDataSnapshot(page, originalUserData);
    await syncServiceWorkerFromStorage(page, ['USER_DATA']);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
    }

    await page.close();
  },

  /**
   * Short timer + ofex.me blocked; yields { popupPage, activePage } (activePage = ofex.me).
   */
  popupPageShortTimerWithOfexBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    const originalUserData = await applyShortTimerPatch(page, HOST_OFEX, OFEX_BLOCKED);
    await popupPage.waitForReady();

    const activePage = await extensionContext.newPage();
    await activePage.goto(OFEX_DEMO_URL);
    await activePage.bringToFront();
    await page.reload();
    await popupPage.waitForReady();

    await use({ popupPage, activePage });

    await restoreUserDataSnapshot(page, originalUserData);
    await syncServiceWorkerFromStorage(page, ['USER_DATA']);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
    }

    await activePage.close();
    await page.close();
  },

  /**
   * Short timer + localhost blocked; yields { popupPage, activePage } (activePage = localhost URL).
   */
  popupPageShortTimerWithLocalhostBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const page = await extensionContext.newPage();
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    const originalUserData = await applyShortTimerPatch(page, HOST_LOCALHOST, LOCALHOST_BLOCKED);
    await popupPage.waitForReady();

    const activePage = await extensionContext.newPage();
    await activePage.goto(LOCALHOST_URL).catch(() => {});
    await activePage.bringToFront();
    await page.reload();
    await popupPage.waitForReady();

    await use({ popupPage, activePage });

    await restoreUserDataSnapshot(page, originalUserData);
    await syncServiceWorkerFromStorage(page, ['USER_DATA']);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
    }

    await activePage.close();
    await page.close();
  },
};

exports.definitions = definitions;
exports.test = base.extend(definitions);
exports.expect = base.expect;
exports.SHORT_TIMER_USER_DATA_PATCH = SHORT_TIMER_USER_DATA_PATCH;
exports.applyShortTimerPatch = applyShortTimerPatch;
exports.restoreUserDataSnapshot = restoreUserDataSnapshot;
exports.readUserDataSnapshot = readUserDataSnapshot;
