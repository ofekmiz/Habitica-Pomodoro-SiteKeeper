/**
 * Short-timer fixture — popupPageShortTimer
 *
 * Patches PomoDurationMins=1, BreakDuration=1, LongBreakDuration=1, ManualBreak=false
 * inside USER_DATA in chrome.storage.sync so timer tests reach automatic break (tomatoBreak)
 * in ~1 minute. The original values are restored after the test.
 */

const { PopupPage } = require('../pages/popupPageModel');
const {
  HOST_OFEX,
  OFEX_DEMO_URL,
  HOST_LOCALHOST,
  LOCALHOST_URL,
} = require('../constants/testConstants');
const { syncServiceWorkerFromStorage, restoreUserData } = require('./userDataStorage');
const { attachFailureScreenshot } = require('../utils/testHelpers');

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
 * Clear in-memory pomodoro/break state in the service worker. Required after
 * syncServiceWorkerFromStorage: that merge keeps Vars.TimerRunning / break flags
 * from a prior test on the same worker.
 * @param {import('@playwright/test').Page} page
 */
async function resetServiceWorkerPomodoro(page) {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { sender: 'popup', msg: 'run_function', functionName: 'pomoReset' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        },
      );
    });
  });
}

/**
 * Reset SW timer state and reload popup — call from beforeEach for parallel short-timer tests.
 * @param {PopupPage} popupPage
 */
async function prepareShortTimerTestStart(popupPage) {
  await resetServiceWorkerPomodoro(popupPage.page);
  await syncServiceWorkerFromStorage(popupPage.page, ['USER_DATA']);
  await popupPage.page.reload();
  await popupPage.waitForReady();
}

/**
 * Patch USER_DATA with short-timer settings and optional blocked host, sync SW, reset timer
 * state, then reload `page`.
 * @param {import('@playwright/test').Page} page
 * @param {string|null} hostname
 * @param {object|null} siteData
 * @returns {Promise<object|null>} previous USER_DATA snapshot for restoreUserData()
 */
async function applyShortTimerPatch(page, hostname, siteData) {
  const originalUserData = await page.evaluate((key) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => resolve(result[key] ?? null));
    });
  }, USER_DATA_KEY);

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
  await resetServiceWorkerPomodoro(page);
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

    await attachFailureScreenshot(page, testInfo);
    await restoreUserData(page, originalUserData);
    await syncServiceWorkerFromStorage(page, ['USER_DATA']);
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

    await attachFailureScreenshot(page, testInfo);
    await restoreUserData(page, originalUserData);
    await syncServiceWorkerFromStorage(page, ['USER_DATA']);
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

    await attachFailureScreenshot(page, testInfo);
    await restoreUserData(page, originalUserData);
    await syncServiceWorkerFromStorage(page, ['USER_DATA']);
    await activePage.close();
    await page.close();
  },
};

exports.definitions = definitions;
exports.prepareShortTimerTestStart = prepareShortTimerTestStart;
