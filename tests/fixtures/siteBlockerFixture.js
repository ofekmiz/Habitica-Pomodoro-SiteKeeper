/**
 * Site-blocker fixtures — popupPageWithOfexBlocked, popupPageWithLocalhostBlocked
 *
 * Each fixture pre-injects a blocked-sites entry into the USER_DATA object in
 * chrome.storage.sync (the storage area the service worker reads) before the
 * test and removes it afterwards for isolation.
 */

const { HOST_OFEX, HOST_LOCALHOST, OFEX_DEMO_URL, LOCALHOST_URL } = require('../constants/testConstants');
const { createScenario, cleanupScenario } = require('./scenarioBuilder');

// ---------------------------------------------------------------------------
// Raw fixture definitions — consumed by fixtures/index.js for merging
// ---------------------------------------------------------------------------

const definitions = {
  /**
   * Popup with ofex.me pre-blocked.
   * Yields { popupPage, activePage } where activePage is a tab open to ofex.me.
   */
  popupPageWithOfexBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    let scenario;
    try {
      scenario = await createScenario({
        extensionContext,
        popupUrl,
        blockedSite: {
          hostname: HOST_OFEX,
          siteData: { hostname: HOST_OFEX, cost: 0, passDuration: 30 },
        },
        activeTabUrl: OFEX_DEMO_URL,
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
   * Popup with localhost pre-blocked.
   * Yields { popupPage, activePage } where activePage is a tab open to localhost.
   */
  popupPageWithLocalhostBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    let scenario;
    try {
      scenario = await createScenario({
        extensionContext,
        popupUrl,
        blockedSite: {
          hostname: HOST_LOCALHOST,
          siteData: { hostname: HOST_LOCALHOST, cost: 0, passDuration: 30 },
        },
        activeTabUrl: LOCALHOST_URL,
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
