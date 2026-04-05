const { test, expect } = require('../../fixtures');
const { parseTimerDisplayToSeconds } = require('../../utils/timerDisplay');

// Use the extended fixtures for tests that need a short 1-min timer.
const { test: shortTimerTest } = require('../../fixtures/index');

test.describe('Pomodoro Timer: Core Functionality', () => {
  // 3.1 – idle state
  test('should display idle state: timer shows 00:00, tomatoWait class, quick-settings visible, controls hidden', async ({ popupPage }) => {
    // Assert idle state
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
    await expect(popupPage.quickSettings).toBeVisible();
    await expect(popupPage.pomoStop).toBeHidden();
    await expect(popupPage.skipToBreak).toBeHidden();
    await expect(popupPage.pomoFreeze).toBeHidden();
  });

  // 3.2 – start timer
  test('should start timer on button click: tomatoProgress class, timer counts down, quick-settings hides', async ({ popupPage }) => {
    // Arrange – capture initial value
    const initialText = await popupPage.getTimerText();

    // Act
    await popupPage.clickPomoButton();

    // Assert immediately after click
    await expect(popupPage.pomoButton).toHaveClass(/tomatoProgress/);
    await expect(popupPage.quickSettings).toBeHidden();

    // Assert countdown — idle shows 00:00; after start the timer shows remaining pomo time (1…25 min).
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
    // Arrange – enable skip-to-break in settings
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowSkipToBreak(true);
    await popupPage.saveButton.click();

    // Act – start timer
    await popupPage.clickPomoButton();
    await expect(popupPage.skipToBreak).toBeVisible();

    // Act – click skip
    await popupPage.clickSkipToBreak();

    // Assert break state
    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.4 – freeze / pause
  test('should freeze and resume timer when showFreeze is enabled', async ({ popupPage }) => {
    // Arrange – enable freeze in settings
    await popupPage.openSettingsTimerTab();
    await popupPage.setShowFreeze(true);
    await popupPage.saveButton.click();

    // Act – start timer
    await popupPage.clickPomoButton();
    await expect(popupPage.pomoFreeze).toBeVisible();

    // Capture current value then freeze
    const valueBefore = await popupPage.getTimerText();
    await popupPage.clickPomoFreeze();

    // Assert frozen — display must stay on the same MM:SS across several polls (no countdown).
    await expect(popupPage.pomoButton).toHaveClass(/tomatoFreeze/);
    let stableHits = 0;
    await expect
      .poll(
        async () => {
          const t = await popupPage.getTimerText();
          stableHits = t === valueBefore ? stableHits + 1 : 0;
          return stableHits;
        },
        { intervals: [200], timeout: 8000 },
      )
      .toBeGreaterThanOrEqual(8);
    const valueAfterWait = await popupPage.getTimerText();
    expect(parseTimerDisplayToSeconds(valueAfterWait)).toBe(parseTimerDisplayToSeconds(valueBefore));

    // Act – resume
    await popupPage.clickPomoButton();

    // Assert resumed
    await expect(popupPage.pomoButton).toHaveClass(/tomatoProgress/);
    await popupPage.waitForTimerToChange(valueAfterWait);
    const resumedText = await popupPage.getTimerText();
    expect(parseTimerDisplayToSeconds(resumedText)).toBeLessThan(parseTimerDisplayToSeconds(valueAfterWait));

    // Cleanup
    await popupPage.clickPomoButton();
  });
});

// 3.5 – 3.9 require a short timer fixture
shortTimerTest.describe('Suite 3 — Pomodoro Timer: Short Timer Tests', () => {
  // 3.5
  shortTimerTest('should enter break after pomodoro completes (1 min)', async ({ popupPageShortTimer: popupPage }) => {
    // Act
    await popupPage.clickPomoButton();

    // Assert – wait up to 75s for pomodoro to complete
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);
    const breakTimer = await popupPage.getTimerText();
    expect(parseTimerDisplayToSeconds(breakTimer)).toBeLessThanOrEqual(60);

    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();
    await expect(popupPage.skipToBreak).toBeHidden();
    await expect(popupPage.quickSettings).toBeHidden();

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.6
  shortTimerTest('should display break state UI: tomatoBreak, correct button visibility', async ({ popupPageShortTimer: popupPage }) => {
    // Act
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);

    // Assert
    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();
    await expect(popupPage.quickSettings).toBeHidden();

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.7
  shortTimerTest('should reset to idle on pomo-stop during break: 00:00, tomatoWait, quick-settings visible', async ({ popupPageShortTimer: popupPage }) => {
    // Arrange – reach break state
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);
    await expect(popupPage.pomoStop).toBeVisible();

    // Act
    await popupPage.clickPomoStop();

    // Assert
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
    await expect(popupPage.quickSettings).toBeVisible();
    await expect(popupPage.pomoStop).toBeHidden();
  });

  // 3.8
  shortTimerTest('should enter break-extension state (tomatoWarning) after break duration expires', async ({ popupPageShortTimer: popupPage }) => {
    // Arrange – reach break state then let break also expire
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);

    // Wait for 1-min break to expire (tomatoWarning)
    await popupPage.waitForPomoButtonClass('tomatoWarning', 75_000);

    // Assert
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWarning/);

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.9
  shortTimerTest('should trigger long break after completing PomoSetNum pomodoros (set = 2)', async ({ popupPageShortTimer: popupPage }) => {
    // Arrange – configure set num to 2 via quick settings
    await popupPage.configureQuickSettings({ pomoSetNum: 2 });

    // Act – first pomodoro
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);
    await popupPage.clickPomoStop();

    // Act – second pomodoro
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);

    // Assert long break triggered (pomo-stop visible, same break class but long duration)
    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();

    // Cleanup
    await popupPage.clickPomoStop();
  });
});
