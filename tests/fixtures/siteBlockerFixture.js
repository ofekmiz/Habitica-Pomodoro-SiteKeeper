/**
 * Site-blocker fixtures — popupPageWithOfexBlocked, popupPageWithLocalhostBlocked
 *
 * Each fixture pre-injects a blocked-sites entry into the USER_DATA object in
 * chrome.storage.sync (the storage area the service worker reads) before the
 * test and removes it afterwards for isolation.
 */

const { test: base } = require('../fixtures');
const { PopupPage } = require('../pages/popupPageModel');

const USER_DATA_KEY = 'USER_DATA';

// ---------------------------------------------------------------------------
// Shared helpers (not exported — internal to this module)
// ---------------------------------------------------------------------------

/**
 * Merge a new hostname entry into BlockedSites inside USER_DATA in storage.sync.
 * Returns the original USER_DATA so it can be restored in teardown.
 */
async function injectBlockedSite(page, hostname, siteData) {
  return page.evaluate(({ key, hostname, siteData }) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        const original = result[key] ?? null;
        const updated = Object.assign({}, original ?? {});
        updated.BlockedSites = Object.assign({}, updated.BlockedSites ?? {}, { [hostname]: siteData });
        chrome.storage.sync.set({ [key]: updated }, () => resolve(original));
      });
    });
  }, { key: USER_DATA_KEY, hostname, siteData });
}

async function restoreUserData(page, original) {
  await page.evaluate(({ key, original }) => {
    return new Promise((resolve) => {
      if (original === null) {
        chrome.storage.sync.remove(key, resolve);
      } else {
        chrome.storage.sync.set({ [key]: original }, resolve);
      }
    });
  }, { key: USER_DATA_KEY, original });
}

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
    // Open the popup first, inject the blocked site, then bring ofex.me to the
    // foreground so getCurrentTabUrl() in the popup sees ofex.me as the active tab.
    const { page: rawPage, originalUserData } = await openPopupWithBlockedSite(
      extensionContext, popupUrl, 'ofex.me', { hostname: 'ofex.me', cost: 0, passDuration: 30 },
    );

    const activePage = await extensionContext.newPage();
    await activePage.goto('https://ofex.me/animation-timer/');

    // ofex.me must be the active tab when the popup re-initialises so that
    // getCurrentTabUrl() returns ofex.me (not the popup's own chrome-extension:// URL).
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
    // Same ordering as ofex: popup first, then bring the target site to front.
    const { page: rawPage, originalUserData } = await openPopupWithBlockedSite(
      extensionContext, popupUrl, 'localhost', { hostname: 'localhost', cost: 0, passDuration: 30 },
    );

    const activePage = await extensionContext.newPage();
    await activePage.goto('http://localhost/').catch(() => {});

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
exports.test   = base.extend(definitions);
exports.expect = base.expect;
