/**
 * Scenario builder — shared setup/teardown for extension tests that mutate
 * chrome.storage.sync USER_DATA, open optional background tabs, and run hooks.
 *
 * Fixtures declare WHAT state they need; this module handles HOW (sync, reload,
 * pomodoro reset, page lifecycle) in one place.
 */

const { PopupPage } = require('../pages/popupPageModel');
const {
  syncServiceWorkerFromStorage,
  restoreUserData,
  resetServiceWorkerPomodoro,
} = require('./userDataStorage');
const { attachFailureScreenshot } = require('../utils/testHelpers');

const USER_DATA_KEY = 'USER_DATA';

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<object|null>}
 */
async function getUserDataSnapshot(page) {
  return page.evaluate((key) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => resolve(result[key] ?? null));
    });
  }, USER_DATA_KEY);
}

/**
 * Merge USER_DATA patch and/or blocked site, sync SW, optionally reset pomodoro, reload popup.
 * Matches previous injectBlockedSite + reload and applyShortTimerPatch behavior.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{
 *   userDataPatch?: object | null,
 *   blockedSite?: { hostname: string, siteData: object } | null,
 *   resetPomodoro?: boolean,
 * }} opts
 * @returns {Promise<object|null>} snapshot before mutation (for restoreUserData)
 */
async function applyUserDataStorage(page, { userDataPatch, blockedSite, resetPomodoro = false }) {
  const originalUserData = await getUserDataSnapshot(page);

  await page.evaluate(({ key, patch, blocked }) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        const updated = Object.assign({}, result[key] ?? {});
        if (patch) Object.assign(updated, patch);
        if (blocked) {
          updated.BlockedSites = Object.assign({}, updated.BlockedSites ?? {}, {
            [blocked.hostname]: blocked.siteData,
          });
          updated.HideEdit = false;
        }
        chrome.storage.sync.set({ [key]: updated }, resolve);
      });
    });
  }, {
    key: USER_DATA_KEY,
    patch: userDataPatch,
    blocked: blockedSite,
  });

  await syncServiceWorkerFromStorage(page, ['USER_DATA']);
  if (resetPomodoro) {
    await resetServiceWorkerPomodoro(page);
  }
  await page.reload();
  return originalUserData;
}

/**
 * @param {object} opts
 * @param {import('@playwright/test').BrowserContext} opts.extensionContext
 * @param {string} opts.popupUrl
 * @param {object} [opts.userDataPatch]
 * @param {{ hostname: string, siteData: object }} [opts.blockedSite]
 * @param {string} [opts.activeTabUrl]
 * @param {boolean} [opts.resetPomodoroAfterUserData=false]
 * @param {(ctx: {
 *   page: import('@playwright/test').Page,
 *   popupPage: InstanceType<typeof PopupPage>,
 *   activePage: import('@playwright/test').Page | null,
 *   extensionContext: import('@playwright/test').BrowserContext,
 * }) => Promise<void>} [opts.afterInit]
 * @returns {Promise<{
 *   page: import('@playwright/test').Page,
 *   popupPage: InstanceType<typeof PopupPage>,
 *   activePage: import('@playwright/test').Page | null,
 *   originalUserData: object | null | undefined,
 *   storageModified: boolean,
 * }>}
 */
async function createScenario({
  extensionContext,
  popupUrl,
  userDataPatch = null,
  blockedSite = null,
  activeTabUrl = null,
  resetPomodoroAfterUserData = false,
  afterInit = null,
}) {
  const page = await extensionContext.newPage();
  let activePage = null;
  try {
    await page.goto(popupUrl);
    const popupPage = new PopupPage(page);
    await popupPage.waitForReady();

    const hasPatch = userDataPatch && Object.keys(userDataPatch).length > 0;
    const hasBlocked = Boolean(blockedSite?.hostname);
    /** @type {object | null | undefined} */
    let originalUserData;
    let storageModified = false;

    if (hasPatch || hasBlocked) {
      originalUserData = await applyUserDataStorage(page, {
        userDataPatch: hasPatch ? userDataPatch : null,
        blockedSite: hasBlocked ? blockedSite : null,
        resetPomodoro: resetPomodoroAfterUserData,
      });
      storageModified = true;
      await popupPage.waitForReady();
    }

    if (activeTabUrl) {
      activePage = await extensionContext.newPage();
      await activePage.goto(activeTabUrl).catch(() => {});
      await activePage.bringToFront();
      await page.reload();
      await popupPage.waitForReady();
    }

    if (afterInit) {
      await afterInit({ page, popupPage, activePage, extensionContext });
    }

    return {
      page,
      popupPage,
      activePage,
      originalUserData,
      storageModified,
    };
  } catch (e) {
    if (activePage && !activePage.isClosed()) await activePage.close().catch(() => {});
    await page.close().catch(() => {});
    throw e;
  }
}

/**
 * @param {object} opts
 * @param {import('@playwright/test').Page} [opts.page]
 * @param {import('@playwright/test').Page | null} [opts.activePage]
 * @param {object | null} [opts.originalUserData] — restore target when storageModified
 * @param {boolean} [opts.storageModified]
 * @param {import('@playwright/test').TestInfo} [opts.testInfo]
 */
async function cleanupScenario({
  page,
  activePage,
  originalUserData,
  storageModified = false,
  testInfo,
} = {}) {
  try {
    if (page) await attachFailureScreenshot(page, testInfo);
  } catch {
    // Best-effort screenshot; continue teardown
  }
  try {
    if (storageModified && page) {
      await restoreUserData(page, originalUserData);
      await syncServiceWorkerFromStorage(page, ['USER_DATA']);
    }
  } catch {
    // Best-effort restore
  }
  try {
    if (activePage && !activePage.isClosed()) await activePage.close().catch(() => {});
  } catch {
    // ignore
  }
  try {
    if (page && !page.isClosed()) await page.close().catch(() => {});
  } catch {
    // ignore
  }
}

module.exports = {
  createScenario,
  cleanupScenario,
  applyUserDataStorage,
  getUserDataSnapshot,
};
