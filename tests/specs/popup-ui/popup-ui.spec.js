const { test, expect } = require('../../fixtures');

test.describe('Popup Initial Load & UI Elements', () => {
  // 1.1
  test('should display main container with all top-level UI sections visible; footer visible', async ({ popupPage }) => {
    await expect(popupPage.mainContainer).toBeVisible();
    await expect(popupPage.menuContainer).toBeVisible();
    await expect(popupPage.pomodoroSection).toBeVisible();
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toBeVisible();
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
    await expect(popupPage.blockLink).toBeVisible();
    await expect(popupPage.siteTable).toBeAttached();
    await expect(popupPage.footer).toBeVisible();
  });

  test('should display main container with all top-level UI sections visible; footer Not visible', async ({ popupPage }) => {
    await popupPage.openSettingsHabiticaTab();
    await popupPage.clickConnectHabiticaToggle();
    await popupPage.clickSettings();
    await popupPage.settingsPanel.waitFor({ state: 'hidden' });

    await expect(popupPage.mainContainer).toBeVisible();
    await expect(popupPage.menuContainer).toBeVisible();
    await expect(popupPage.pomodoroSection).toBeVisible();
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toBeVisible();
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
    await expect(popupPage.blockLink).toBeVisible();
    await expect(popupPage.siteTable).toBeAttached();
    await expect(popupPage.footer).toBeHidden();
  });

  // 1.2
  test('should show welcome info when no sites are blocked; block-link shows "Block Site!"', async ({ popupPage }) => {
    await expect(popupPage.welcomeInfo).toBeVisible();
    await expect(popupPage.welcomeInfo).toContainText(/block site/i);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
  });

  // 1.3
  test('should NOT show save button on initial load (no panel open)', async ({ popupPage }) => {
    await expect(popupPage.saveButton).toBeHidden();
    await expect(popupPage.settingsPanel).toBeHidden();
    await expect(popupPage.historyPanel).toBeHidden();
    await expect(popupPage.feedbackPanel).toBeHidden();
    await expect(popupPage.donatePanel).toBeHidden();
  });

  // 1.4
  test('should display open-in-new-window button and open new window on click', async ({ popupPage, extensionContext }) => {
    await expect(popupPage.popupNewWindow).toBeVisible();

    const [newPage] = await Promise.all([
      extensionContext.waitForEvent('page'),
      popupPage.popupNewWindow.click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await expect(newPage).toHaveURL(/popup\.html/);
    // Cleanup
    await newPage.close();
  });
});
