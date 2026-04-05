/**
 * Site-blocker fixtures — popupPageWithOfexBlocked, popupPageWithLocalhostBlocked
 *
 * Each fixture pre-injects a blocked-sites entry into the USER_DATA object in
 * chrome.storage.sync (the storage area the service worker reads) before the
 * test and removes it afterwards for isolation.
 */

const { test: base } = require('../fixtures');
const { PopupPage } = require('../pages/popupPageModel');
const { injectBlockedSite, restoreUserData } = require('./userDataStorage');
const { HOST_OFEX, HOST_LOCALHOST, OFEX_DEMO_URL, LOCALHOST_URL } = require('../constants/testConstants');

async function openPopupWithBlockedSite(extensionContext, popupUrl, hostname, siteData) {
  const page = await extensionContext.newPage();
  await page.goto(popupUrl);
  const popupPage = new PopupPage(page);
  await popupPage.waitForReady();

  const originalUserData = await injectBlockedSite(page, hostname, siteData);

  await page.reload();
  await popupPage.waitForReady();

  return { page, originalUserData };
}

async function attachFailureScreenshot(page, testInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath('failure.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
  }
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
    const { page: rawPage, originalUserData } = await openPopupWithBlockedSite(
      extensionContext,
      popupUrl,
      HOST_OFEX,
      { hostname: HOST_OFEX, cost: 0, passDuration: 30 },
    );

    const activePage = await extensionContext.newPage();
    await activePage.goto(OFEX_DEMO_URL);

    await activePage.bringToFront();
    await rawPage.reload();
    const popupPage = new PopupPage(rawPage);
    await popupPage.waitForReady();

    await use({ popupPage, activePage });

    await restoreUserData(rawPage, originalUserData);
    await attachFailureScreenshot(rawPage, testInfo);
    await rawPage.close();
    await activePage.close();
  },

  /**
   * Popup with localhost pre-blocked.
   * Yields { popupPage, activePage } where activePage is a tab open to localhost.
   */
  popupPageWithLocalhostBlocked: async ({ extensionContext, popupUrl }, use, testInfo) => {
    const { page: rawPage, originalUserData } = await openPopupWithBlockedSite(
      extensionContext,
      popupUrl,
      HOST_LOCALHOST,
      { hostname: HOST_LOCALHOST, cost: 0, passDuration: 30 },
    );

    const activePage = await extensionContext.newPage();
    await activePage.goto(LOCALHOST_URL).catch(() => {});

    await activePage.bringToFront();
    await rawPage.reload();
    const popupPage = new PopupPage(rawPage);
    await popupPage.waitForReady();

    await use({ popupPage, activePage });

    await restoreUserData(rawPage, originalUserData);
    await attachFailureScreenshot(rawPage, testInfo);
    await rawPage.close();
    await activePage.close();
  },
};

exports.definitions = definitions;
exports.test = base.extend(definitions);
exports.expect = base.expect;
