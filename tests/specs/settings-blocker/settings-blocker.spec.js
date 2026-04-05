const { test, expect } = require('../../fixtures/index');

test.describe('Settings: Blocker Tab', () => {
  // 7.1
  test('should display all blocker settings fields', async ({ popupPage }) => {
    // Arrange
    await popupPage.openSettingsBlockerTab();

    // Assert non-gated inputs visible
    await expect(popupPage.hideEditCheckbox).toBeVisible();
    await expect(popupPage.muteBlockedSitesCheckbox).toBeVisible();
    await expect(popupPage.transparentOverlayCheckbox).toBeVisible();
    await expect(popupPage.whitelistTextarea).toBeVisible();

    // Assert gated (habitica-setting class) elements present in DOM
    await expect(popupPage.vacationModeToggle).toBeAttached();
    await expect(popupPage.breakFreePassCheckbox).toBeAttached();
    await expect(popupPage.freePassBlocks).toBeAttached();
  });

  // 7.2
  test('should save whitelist entry "ofex.me/animation-timer" and persist after reload', async ({ popupPage }) => {
    // Arrange
    await popupPage.openSettingsBlockerTab();

    // Act
    await popupPage.whitelistTextarea.fill('ofex.me/animation-timer');
    await popupPage.saveButton.click();

    // Reload and verify
    await popupPage.reloadPopup();
    await popupPage.openSettingsBlockerTab();

    // Assert
    await expect(popupPage.whitelistTextarea).toHaveValue(/ofex\.me\/animation-timer/);

    // Cleanup
    await popupPage.whitelistTextarea.fill('');
    await popupPage.saveButton.click();
  });

  // 7.3 — uses popupPageWithOfexBlocked fixture which opens a fresh popup
  // after injecting ofex.me into storage, so the service worker picks it up
  test('should hide edit/delete controls and block-link when hide-edit is enabled', async ({ popupPageWithOfexBlocked }) => {
    const { popupPage } = popupPageWithOfexBlocked;

    // Act – enable hide-edit in blocker settings
    await popupPage.openSettingsBlockerTab();
    await popupPage.hideEditCheckbox.check();
    await popupPage.saveButton.click();

    // Close settings panel to return to main view
    await popupPage.clickSettings();

    // Assert edit / delete buttons hidden for the ofex.me row
    await expect(popupPage.siteRowEditButton('ofex.me')).toBeHidden();
    await expect(popupPage.siteRowDeleteButton('ofex.me')).toBeHidden();
    // Assert block-link hidden
    await expect(popupPage.blockLink).toBeHidden();

    // Cleanup – uncheck hide-edit so it doesn't bleed into other tests
    await popupPage.openSettingsBlockerTab();
    await popupPage.hideEditCheckbox.uncheck();
    await popupPage.saveButton.click();
  });
});
