const { test, expect } = require('../../fixtures');
const {
  DEFAULT_POMO_DURATION,
  DEFAULT_BREAK_DURATION,
  DEFAULT_LONG_BREAK_DURATION,
  DEFAULT_POMO_SET_NUM,
} = require('../../constants/testConstants');

test.describe('Quick Settings', () => {
  // 4.1
  test('should open quick-settings overlay: gear icon click → overlay appears, fields pre-filled, pomodoro section hides', async ({ popupPage }) => {
    await popupPage.openQuickSettings();

    await expect(popupPage.quickSettingsPanel).toBeVisible();

    await expect(popupPage.quickSetPomoDuration).toBeVisible();
    await expect(popupPage.quickSetPomoDuration).toHaveValue(DEFAULT_POMO_DURATION);
    await expect(popupPage.quickSetBreakDuration).toHaveValue(DEFAULT_BREAK_DURATION);
    await expect(popupPage.quickSetLongBreakDuration).toHaveValue(DEFAULT_LONG_BREAK_DURATION);
    await expect(popupPage.quickSetPomoSetNum).toHaveValue(DEFAULT_POMO_SET_NUM);

    await expect(popupPage.pomodoroSection).toBeHidden();
  });

  // 4.2
  test('should save quick settings: change pomo duration to 30, click OK, panel closes, duration persisted', async ({ popupPage }) => {
    await popupPage.openQuickSettings();
    await popupPage.quickSetPomoDuration.fill('30');
    await expect(popupPage.quickSetPomoDuration).toHaveValue('30');
    await popupPage.saveQuickSettings();

    await expect(popupPage.quickSettingsPanel).toBeHidden();
    await expect(popupPage.pomodoroSection).toBeVisible();

    await popupPage.openQuickSettings();
    await expect(popupPage.quickSetPomoDuration).toHaveValue('30');

    // Cleanup
    await popupPage.quickSetPomoDuration.fill(DEFAULT_POMO_DURATION);
    await popupPage.saveQuickSettings();
  });

  // 4.3
  test('should take manual break: set duration to 5, click take-break → break starts, set counter shows --/--', async ({ popupPage }) => {
    await popupPage.openQuickSettings();
    await popupPage.quickSetTakeBreakDuration.fill('5');
    await expect(popupPage.quickSetTakeBreakDuration).toHaveValue('5');

    await popupPage.quickSetTakeBreak.click();
    await expect(popupPage.quickSettingsPanel).toBeHidden();
    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);

    await expect(popupPage.timerDisplay).toHaveAttribute('data-pomodoros-set', '--/--');

    // Cleanup
    await popupPage.clickPomoButton();
  });
});
