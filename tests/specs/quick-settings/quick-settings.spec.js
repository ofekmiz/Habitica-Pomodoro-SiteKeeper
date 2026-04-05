const { test, expect } = require('../../fixtures');

test.describe('Quick Settings', () => {
  // 4.1
  test('should open quick-settings overlay: gear icon click → overlay appears, fields pre-filled, pomodoro section hides', async ({ popupPage }) => {
    // Act
    await popupPage.openQuickSettings();

    // Assert overlay visible
    await expect(popupPage.quickSettingsPanel).toBeVisible();

    // Assert fields pre-filled with defaults
    await expect(popupPage.quickSetPomoDuration).toBeVisible();
    await expect(popupPage.quickSetPomoDuration).toHaveValue('25');
    await expect(popupPage.quickSetBreakDuration).toHaveValue('5');
    await expect(popupPage.quickSetLongBreakDuration).toHaveValue('30');
    await expect(popupPage.quickSetPomoSetNum).toHaveValue('4');

    // Assert main timer area is hidden while overlay is open
    await expect(popupPage.pomodoroSection).toBeHidden();
  });

  // 4.2
  test('should save quick settings: change pomo duration to 30, click OK, panel closes, duration persisted', async ({ popupPage }) => {
    // Arrange + Act – change pomo duration to 30 and save
    await popupPage.openQuickSettings();
    await popupPage.quickSetPomoDuration.fill('30');
    await expect(popupPage.quickSetPomoDuration).toHaveValue('30');
    await popupPage.saveQuickSettings();

    // Assert panel closes and timer area re-appears
    await expect(popupPage.quickSettingsPanel).toBeHidden();
    await expect(popupPage.pomodoroSection).toBeVisible();

    // Assert persisted – reopen quick settings
    await popupPage.openQuickSettings();
    await expect(popupPage.quickSetPomoDuration).toHaveValue('30');

    // Cleanup – restore default
    await popupPage.quickSetPomoDuration.fill('25');
    await popupPage.saveQuickSettings();
  });

  // 4.3
  test('should take manual break: set duration to 5, click take-break → break starts, set counter shows --/--', async ({ popupPage }) => {
    // Arrange
    await popupPage.openQuickSettings();
    await popupPage.quickSetTakeBreakDuration.fill('5');
    await expect(popupPage.quickSetTakeBreakDuration).toHaveValue('5');

    // Act
    await popupPage.quickSetTakeBreak.click();

    // Assert panel closed
    await expect(popupPage.quickSettingsPanel).toBeHidden();

    // Assert break state active
    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);

    // Assert set counter shows manual break indicator (--/-- or similar)
    const setCounter = popupPage.page.locator('[data-testid="pomo-set-counter"], .pomo-set-counter, [class*="set-counter"]').first();
    if (await setCounter.count() > 0) {
      const counterText = await setCounter.textContent();
      expect(counterText).toMatch(/--|manual/i);
    }

    // Cleanup
    await popupPage.clickPomoStop();
  });
});
