const { test, expect } = require('../../fixtures/index');
const { HOST_LOCALHOST, LOCALHOST_URL } = require('../../constants/testConstants');
const { injectBlockedSite, restoreUserData, removeBlockedHostname } = require('../../fixtures/userDataStorage');

test.describe('Site Blocker: localhost (non-real site)', () => {
  // 9.1
  test('should show "Block Site!" when localhost is not blocked', async ({ popupPage, extensionContext }) => {
    // Arrange – open localhost tab (ignore connection errors)
    const tab = await extensionContext.newPage();
    await tab.goto(LOCALHOST_URL).catch(() => {});
    await popupPage.reloadPopup();

    // Assert
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.siteRow(HOST_LOCALHOST)).toHaveCount(0);

    await tab.close();
  });

  // 9.2
  test('should block localhost: row appears, link changes to "Un-Block Site", no console errors', async ({
    popupPage,
    extensionContext,
    noConsoleErrors,
  }) => {
    // Arrange – open localhost tab
    const tab = await extensionContext.newPage();
    await tab.goto(LOCALHOST_URL).catch(() => {});
    await popupPage.reloadPopup();

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow(HOST_LOCALHOST)).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    await tab.close();
    // Cleanup
    await removeBlockedHostname(popupPage.page, HOST_LOCALHOST);
  });

  // 9.3
  test('should unblock localhost via block-link: row removed, link reverts, no JS errors', async ({
    popupPage,
    extensionContext,
    noConsoleErrors,
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

    // Assert initial state
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow(HOST_LOCALHOST)).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);

    await tab.close();
    await restoreUserData(popupPage.page, original);
  });

  // 9.4
  test('should delete localhost via trash button: row removed, link reverts, no JS errors', async ({
    popupPage,
    noConsoleErrors,
  }) => {
    // Arrange
    const original = await injectBlockedSite(popupPage.page, HOST_LOCALHOST, {
      hostname: HOST_LOCALHOST,
      cost: 0,
      passDuration: 30,
    });
    await popupPage.reloadPopup();

    // Act
    await popupPage.siteRowDeleteButton(HOST_LOCALHOST).click();

    // Assert
    await expect(popupPage.siteRow(HOST_LOCALHOST)).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);

    await restoreUserData(popupPage.page, original);
  });
});
