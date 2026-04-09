const { test, expect } = require('../../fixtures');
const { parseTimerDisplayToSeconds } = require('../../utils/timerDisplay');

test.describe('Pomodoro Timer: Core Functionality', () => {
  // 3.1 – idle state
  test('should display idle state: timer shows 00:00, tomatoWait class, quick-settings visible, controls hidden', async ({ popupPage }) => {
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
    await expect(popupPage.quickSettings).toBeVisible();
    await expect(popupPage.pomoStop).toBeHidden();
    await expect(popupPage.skipToBreak).toBeHidden();
    await expect(popupPage.pomoFreeze).toBeHidden();
  });

  // 3.2 – start timer
  test('should start timer on button click: tomatoProgress class, timer counts down, quick-settings hides', async ({ popupPage }) => {
    const initialText = await popupPage.getTimerText();

    await popupPage.clickPomoButton();

    await expect(popupPage.pomoButton).toHaveClass(/tomatoProgress/);
    await expect(popupPage.quickSettings).toBeHidden();

    //idle shows 00:00; after start the timer shows remaining pomo time (1…25 min).
    await popupPage.waitForTimerToChange(initialText);
    const newText = await popupPage.getTimerText();
    const newSec = parseTimerDisplayToSeconds(newText);
    expect(newSec).toBeGreaterThan(0);
    expect(newSec).toBeLessThanOrEqual(25 * 60);

    // Cleanup
    await popupPage.clickPomoButton(); // toggle off / stop
  });

  // 3.3 – skip to break
  test('should skip to break when showSkipToBreak is enabled', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowSkipToBreak(true);
    await popupPage.saveButton.click();

    await popupPage.clickPomoButton();
    await expect(popupPage.skipToBreak).toBeVisible();

    await popupPage.clickSkipToBreak();

    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.4 – freeze / pause
  test('should freeze and resume timer when showFreeze is enabled', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowFreeze(true);
    await popupPage.saveButton.click();

    await popupPage.clickPomoButton();
    await expect(popupPage.pomoFreeze).toBeVisible();
    await popupPage.waitForTimerToChange('00:00');

    const valueBefore = await popupPage.getTimerText();
    await popupPage.clickPomoFreeze();

    // Test plan 3.4: timer display frozen (same value after 2 seconds).
    await expect(popupPage.pomoButton).toHaveClass(/tomatoFreeze/);
  // Verify timer stays frozen for 2 seconds
    await expect
      .poll(async () => await popupPage.getTimerText(), { timeout: 2000, intervals: [200] })
      .toBe(valueBefore);
    const valueAfterWait = await popupPage.getTimerText();
    expect(parseTimerDisplayToSeconds(valueAfterWait)).toBe(parseTimerDisplayToSeconds(valueBefore));

    await popupPage.clickPomoButton();

    await expect(popupPage.pomoButton).toHaveClass(/tomatoProgress/);
    await popupPage.waitForTimerToChange(valueAfterWait);
    const resumedText = await popupPage.getTimerText();
    expect(parseTimerDisplayToSeconds(resumedText)).toBeLessThan(parseTimerDisplayToSeconds(valueAfterWait));

    // Cleanup
    await popupPage.clickPomoButton();
  });
});
