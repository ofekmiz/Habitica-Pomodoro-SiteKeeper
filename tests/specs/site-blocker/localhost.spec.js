const { test, expect } = require('../../fixtures/index');
const { HOST_LOCALHOST, LOCALHOST_URL } = require('../../constants/testConstants');
const { injectBlockedSite, restoreUserData, removeBlockedHostname } = require('../../fixtures/userDataStorage');

test.describe('Site Blocker: localhost (non-real site)', () => {
  // 9.1
  test('should show "Block Site!" when localhost is not blocked', async ({ popupPage, extensionContext }) => {
    const tab = await extensionContext.newPage();
    await tab.goto(LOCALHOST_URL).catch(() => {});
    await popupPage.reloadPopup();

    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.siteRow(HOST_LOCALHOST)).toHaveCount(0);

    await tab.close();
  });

  // 9.2
  test('should block localhost: row appears, link changes to "Un-Block Site", no console errors', async ({
    popupPage,
    extensionContext,
  }) => {
    const tab = await extensionContext.newPage();
    await tab.goto(LOCALHOST_URL).catch(() => {});
    await popupPage.reloadPopup();

    await popupPage.blockLink.click();

    await expect(popupPage.siteRow(HOST_LOCALHOST)).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    await tab.close();
    // Cleanup
    await removeBlockedHostname(popupPage.page, HOST_LOCALHOST);
  });

  // 9.3
  test('should unblock localhost via block-link: row removed, link reverts', async ({
    popupPage,
    extensionContext,
  }) => {
    // Arrange
    const original = await injectBlockedSite(popupPage.page, HOST_LOCALHOST, {
      hostname: HOST_LOCALHOST,
      cost: 0,
      passDuration: 30,
    });
    const tab = await extensionContext.newPage();
    await tab.goto(LOCALHOST_URL).catch(() => {});
    await popupPage.reloadPopup();

    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow(HOST_LOCALHOST)).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);

    await tab.close();
    // Cleanup
    await restoreUserData(popupPage.page, original);
  });

  // 9.4
  test('should delete localhost via trash button: row removed, link reverts', async ({
    popupPage,
  }) => {
    const original = await injectBlockedSite(popupPage.page, HOST_LOCALHOST, {
      hostname: HOST_LOCALHOST,
      cost: 0,
      passDuration: 30,
    });
    await popupPage.reloadPopup();

    await popupPage.siteRowDeleteButton(HOST_LOCALHOST).click();

    await expect(popupPage.siteRow(HOST_LOCALHOST)).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);

    // Cleanup
    await restoreUserData(popupPage.page, original);
  });

  // 9.5 — same tbody `blocked` behaviour as ofex.me (popup.js toggles #SiteTable tbody.blocked).
  test('should apply "blocked" CSS class during pomodoro, remove during break', async ({
    popupPageShortTimerWithLocalhostBlocked: { popupPage },
  }) => {
    const row = popupPage.siteRow(HOST_LOCALHOST);

    await popupPage.clickPomoButton();

    await expect(row).toHaveClass(/blocked/);

    await popupPage.waitForPomoButtonClass('tomatoBreak');

    await expect(row).not.toHaveClass(/blocked/);

    await popupPage.clickPomoStop();
  });

  // Full-tab "Stay Focused" overlay (body.blockedSite) is asserted for ofex.me in ofexme.spec.js; the service worker uses
  // the same blockSiteOverlay path for any blocked hostname, including localhost, when the tab shows a real origin.
});
