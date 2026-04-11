/**
 * Short-timer fixture — popupPageShortTimer
 *
 * Patches PomoDurationMins=1, BreakDuration=1, LongBreakDuration=1, ManualBreak=false
 * inside USER_DATA in chrome.storage.sync so timer tests reach automatic break (tomatoBreak)
 * in ~1 minute. The original values are restored after the test.
 */

const {
  HOST_OFEX,
  OFEX_DEMO_URL,
  HOST_LOCALHOST,
  LOCALHOST_URL,
} = require('../constants/testConstants');
const { syncServiceWorkerFromStorage, resetServiceWorkerPomodoro } = require('./userDataStorage');
const { createScenario, cleanupScenario, applyUserDataStorage } = require('./scenarioBuilder');

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
 * Reset SW timer state and reload popup — call from beforeEach for parallel short-timer tests.
 * @param {import('../pages/popupPageModel').PopupPage} popupPage
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
  return applyUserDataStorage(page, {
    userDataPatch: SHORT_TIMER_USER_DATA_PATCH,
    blockedSite: hostname && siteData ? { hostname, siteData } : null,
    resetPomodoro: true,
  });
}

/** Raw fixture definitions — consumed by fixtures/index.js for merging. */
const definitions = {
  popupPageShortTimer: async ({ extensionContext, popupUrl }, use, testInfo) => {
    let scenario;
    try {
      scenario = await createScenario({
        extensionContext,
        popupUrl,
        userDataPatch: SHORT_TIMER_USER_DATA_PATCH,
        resetPomodoroAfterUserData: true,
      });
      await use(scenario.popupPage);
    } finally {
      await cleanupScenario({
        page: scenario?.page,
        activePage: scenario?.activePage,
        originalUserData: scenario?.originalUserData,
        storageModified: scenario?.storageModified,
        testInfo,
      });
    }
  },

  /**
   * Short timer + ofex.me blocked; yields { popupPage, activePage } (activePage = ofex.me).
   */
  popupPageShortTimerWithOfexBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    let scenario;
    try {
      scenario = await createScenario({
        extensionContext,
        popupUrl,
        userDataPatch: SHORT_TIMER_USER_DATA_PATCH,
        blockedSite: { hostname: HOST_OFEX, siteData: OFEX_BLOCKED },
        activeTabUrl: OFEX_DEMO_URL,
        resetPomodoroAfterUserData: true,
      });
      await use({ popupPage: scenario.popupPage, activePage: scenario.activePage });
    } finally {
      await cleanupScenario({
        page: scenario?.page,
        activePage: scenario?.activePage,
        originalUserData: scenario?.originalUserData,
        storageModified: scenario?.storageModified,
        testInfo,
      });
    }
  },

  /**
   * Short timer + localhost blocked; yields { popupPage, activePage } (activePage = localhost URL).
   */
  popupPageShortTimerWithLocalhostBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    let scenario;
    try {
      scenario = await createScenario({
        extensionContext,
        popupUrl,
        userDataPatch: SHORT_TIMER_USER_DATA_PATCH,
        blockedSite: { hostname: HOST_LOCALHOST, siteData: LOCALHOST_BLOCKED },
        activeTabUrl: LOCALHOST_URL,
        resetPomodoroAfterUserData: true,
      });
      await use({ popupPage: scenario.popupPage, activePage: scenario.activePage });
    } finally {
      await cleanupScenario({
        page: scenario?.page,
        activePage: scenario?.activePage,
        originalUserData: scenario?.originalUserData,
        storageModified: scenario?.storageModified,
        testInfo,
      });
    }
  },
};

exports.definitions = definitions;
exports.prepareShortTimerTestStart = prepareShortTimerTestStart;
exports.applyShortTimerPatch = applyShortTimerPatch;
