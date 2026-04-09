/**
 * Site-blocker fixtures — popupPageWithOfexBlocked, popupPageWithLocalhostBlocked
 *
 * Each fixture pre-injects a blocked-sites entry into the USER_DATA object in
 * chrome.storage.sync (the storage area the service worker reads) before the
 * test and removes it afterwards for isolation.
 */

const { PopupPage } = require('../pages/popupPageModel');
const { injectBlockedSite, restoreUserData } = require('./userDataStorage');
const { HOST_OFEX, HOST_LOCALHOST, OFEX_DEMO_URL, LOCALHOST_URL } = require('../constants/testConstants');
const { attachFailureScreenshot } = require('../utils/testHelpers');

async function openPopupWithBlockedSite(extensionContext, popupUrl, hostname, siteData) {
  const page = await extensionContext.newPage();
  await page.goto(popupUrl);
  const popupPage = new PopupPage(page);
  await popupPage.waitForReady();

  const originalUserData = await injectBlockedSite(page, hostname, siteData);

  await page.reload();
  await popupPage.waitForReady();

  return { page, popupPage, originalUserData };
}

// ---------------------------------------------------------------------------
// Raw fixture definitions — consumed by fixtures/index.js for merging
// ---------------------------------------------------------------------------

const definitions = {
  /**
   * Popup with ofex.me pre-blocked.
   * Yields { popupPage, activePage } where activePage is a tab open to ofex.me.
   */
  popupPageWithOfexBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const { page, popupPage, originalUserData } = await openPopupWithBlockedSite(
      extensionContext,
      popupUrl,
      HOST_OFEX,
      { hostname: HOST_OFEX, cost: 0, passDuration: 30 },
    );

    const activePage = await extensionContext.newPage();
    await activePage.goto(OFEX_DEMO_URL);

    await activePage.bringToFront();
    await page.reload();
    await popupPage.waitForReady();

    await use({ popupPage, activePage });

    await attachFailureScreenshot(page, testInfo);
    await restoreUserData(page, originalUserData);
    await page.close();
    await activePage.close();
  },

  /**
   * Popup with localhost pre-blocked.
   * Yields { popupPage, activePage } where activePage is a tab open to localhost.
   */
  popupPageWithLocalhostBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const { page, popupPage, originalUserData } = await openPopupWithBlockedSite(
      extensionContext,
      popupUrl,
      HOST_LOCALHOST,
      { hostname: HOST_LOCALHOST, cost: 0, passDuration: 30 },
    );

    const activePage = await extensionContext.newPage();
    await activePage.goto(LOCALHOST_URL).catch(() => {});

    await activePage.bringToFront();
    await page.reload();
    await popupPage.waitForReady();

    await use({ popupPage, activePage });

    await attachFailureScreenshot(page, testInfo);
    await restoreUserData(page, originalUserData);
    await page.close();
    await activePage.close();
  },
};

exports.definitions = definitions;
