const { test, expect } = require('../../fixtures');

test.describe('Settings: Timer Tab', () => {
  // 5.1
  test('should display all timer fields with correct defaults', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();

    await expect(popupPage.pomoDurationInput).toHaveValue('25');
    await expect(popupPage.breakDurationInput).toHaveValue('5');
    await expect(popupPage.longBreakDurationInput).toHaveValue('30');
    await expect(popupPage.pomoSetNumInput).toHaveValue('4');
    await expect(popupPage.breakExtensionInput).toHaveValue('2');

    await expect(popupPage.showSkipToBreakCheckbox).not.toBeChecked();
    await expect(popupPage.showFreezeCheckbox).not.toBeChecked();
    await expect(popupPage.manualBreakCheckbox).toBeChecked();
    await expect(popupPage.resetPomoAfterBreakCheckbox).not.toBeChecked();

    await expect(popupPage.pomodoroEndSoundSelect).toBeVisible();
    await expect(popupPage.breakEndSoundSelect).toBeVisible();
    await expect(popupPage.ambientSoundSelect).toBeVisible();
  });

  // 5.2
  test('should save pomo duration change to 35 and persist after reload', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    await popupPage.pomoDurationInput.fill('35');
    await popupPage.saveButton.click();

    await popupPage.reloadPopup();
    await popupPage.openSettingsTimerTab();

    await expect(popupPage.pomoDurationInput).toHaveValue('35');

    // Cleanup
    await popupPage.pomoDurationInput.fill('25');
    await popupPage.saveButton.click();
  });

  // 5.3
  test('should save break duration change to 10 and persist after reload', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    await popupPage.breakDurationInput.fill('10');
    await popupPage.saveButton.click();

    await popupPage.reloadPopup();
    await popupPage.openSettingsTimerTab();

    await expect(popupPage.breakDurationInput).toHaveValue('10');

    // Cleanup
    await popupPage.breakDurationInput.fill('5');
    await popupPage.saveButton.click();
  });

  // 5.4
  test('should persist skip-to-break setting and show >> button when timer running', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowSkipToBreak(true);
    await popupPage.saveButton.click();

    await popupPage.reloadPopup();
    await popupPage.openSettingsTimerTab();
    await expect(popupPage.showSkipToBreakCheckbox).toBeChecked();

    await popupPage.clickSettings();
    await popupPage.clickPomoButton();
    await expect(popupPage.skipToBreak).toBeVisible();

    // Cleanup — stop pomodoro (X / End session is only shown during break, not while pomodoro is running)
    await popupPage.clickPomoButton();
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowSkipToBreak(false);
    await popupPage.saveButton.click();
  });

  // 5.5
  test('should persist freeze setting and show snowflake button when timer running', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowFreeze(true);
    await popupPage.saveButton.click();

    await popupPage.reloadPopup();
    await popupPage.openSettingsTimerTab();
    await expect(popupPage.showFreezeCheckbox).toBeChecked();

    await popupPage.clickSettings();
    await popupPage.clickPomoButton();
    await expect(popupPage.pomoFreeze).toBeVisible();

    // Cleanup — same as skip-to-break test: stop via tomato while pomodoro is running
    await popupPage.clickPomoButton();
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowFreeze(false);
    await popupPage.saveButton.click();
  });

  // 5.6
  test('should save sound selections (Sound1, Ambient Rain) and persist after reload', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();

    await popupPage.pomodoroEndSoundSelect.selectOption({ value: 'Sound1.mp3' });
    await popupPage.ambientSoundSelect.selectOption({ value: 'Ambient Rain.mp3' });

    await popupPage.saveButton.click();
    await popupPage.reloadPopup();
    await popupPage.openSettingsTimerTab();

    await expect(popupPage.pomodoroEndSoundSelect).toHaveValue('Sound1.mp3');
    await expect(popupPage.ambientSoundSelect).toHaveValue('Ambient Rain.mp3');
  });
});
