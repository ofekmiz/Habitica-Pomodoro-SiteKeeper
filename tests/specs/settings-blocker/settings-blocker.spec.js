const { test, expect } = require('../../fixtures/index');
const { HOST_OFEX, OFEX_WHITELIST_SAMPLE } = require('../../constants/testConstants');

test.describe('Settings: Blocker Tab', () => {
  // 7.1
  test('should display all blocker settings fields', async ({ popupPage }) => {
    await popupPage.openSettingsBlockerTab();

    await expect(popupPage.hideEditLabel).toBeVisible();
    await expect(popupPage.muteBlockedSitesLabel).toBeVisible();
    await expect(popupPage.transparentOverlayLabel).toBeVisible();
    await expect(popupPage.whitelistTextarea).toBeVisible();

    await expect(popupPage.vacationModeToggle).toBeAttached();
    await expect(popupPage.breakFreePassCheckbox).toBeAttached();
    await expect(popupPage.freePassBlocks).toBeAttached();
  });

  // 7.2
  test('should save whitelist entry "ofex.me/animation-timer" and persist after reload', async ({ popupPage }) => {
    await popupPage.openSettingsBlockerTab();

    await popupPage.whitelistTextarea.fill(OFEX_WHITELIST_SAMPLE);
    await popupPage.saveButton.click();

    await popupPage.reloadPopup();
    await popupPage.openSettingsBlockerTab();

    await expect(popupPage.whitelistTextarea).toHaveValue(/ofex\.me\/animation-timer/);

    // Cleanup
    await popupPage.whitelistTextarea.fill('');
    await popupPage.saveButton.click();
  });

  // 7.3 — uses popupPageWithOfexBlocked fixture which opens a fresh popup
  test('should hide edit/delete controls and block-link when hide-edit is enabled', async ({ popupPageWithOfexBlocked }) => {
    const { popupPage } = popupPageWithOfexBlocked;

    await popupPage.openSettingsBlockerTab();
    await popupPage.setHideEdit(true);
    await popupPage.saveButton.click();

    await popupPage.clickSettings();

    await expect(popupPage.siteRowEditButton(HOST_OFEX)).toBeHidden();
    await expect(popupPage.siteRowDeleteButton(HOST_OFEX)).toBeHidden();
    await expect(popupPage.blockLink).toBeHidden();

    // Cleanup
    await popupPage.openSettingsBlockerTab();
    await popupPage.setHideEdit(false);
    await popupPage.saveButton.click();
  });
});
