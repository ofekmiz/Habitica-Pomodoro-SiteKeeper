const { test: shortTimerTest, expect } = require('../../fixtures/index');
const { prepareShortTimerTestStart } = require('../../fixtures/shortTimerFixture');
const { parseTimerDisplayToSeconds } = require('../../utils/timerDisplay');

// 3.5 – 3.9 require a short timer fixture
shortTimerTest.describe.parallel('Pomodoro Timer: Short Timer Tests', () => {
  shortTimerTest.beforeEach(async ({ popupPageShortTimer: popupPage }) => {
    await prepareShortTimerTestStart(popupPage);
  });

  // 3.5
  shortTimerTest('should enter break after pomodoro completes (1 min)', async ({ popupPageShortTimer: popupPage }) => {
    await popupPage.clickPomoButton();

    //wait up to 75s for pomodoro to complete
    await popupPage.waitForPomoButtonClass('tomatoBreak');
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
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak');

    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();
    await expect(popupPage.quickSettings).toBeHidden();

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.7
  shortTimerTest('should reset to idle on pomo-stop during break: 00:00, tomatoWait, quick-settings visible', async ({ popupPageShortTimer: popupPage }) => {
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak');
    await expect(popupPage.pomoStop).toBeVisible();

    await popupPage.clickPomoStop();

    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
    await expect(popupPage.quickSettings).toBeVisible();
    await expect(popupPage.pomoStop).toBeHidden();
  });

  // 3.8
  shortTimerTest('should enter break-extension state (tomatoWarning) after break duration expires', async ({ popupPageShortTimer: popupPage }) => {
    // Reach break state then let break also expire
    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak');

    // Wait for 1-min break to expire (tomatoWarning)
    await popupPage.waitForPomoButtonClass('tomatoWarning');

    await expect(popupPage.pomoButton).toHaveClass(/tomatoWarning/);

    // Cleanup
    await popupPage.clickPomoStop();
  });

  // 3.9
  shortTimerTest('should trigger long break after completing PomoSetNum pomodoros (set = 2)', async ({ popupPageShortTimer: popupPage }) => {
    // Configure set num to 2 via quick settings
    await popupPage.configureQuickSettings({ pomoSetNum: 2 });

    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak');
    await popupPage.clickPomoStop();

    await popupPage.clickPomoButton();
    await popupPage.waitForPomoButtonClass('tomatoBreak');

    await expect(popupPage.pomoButton).toHaveClass(/tomatoBreak/);
    await expect(popupPage.pomoStop).toBeVisible();

    // Cleanup
    await popupPage.clickPomoStop();
  });
});
