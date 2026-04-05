const { test, expect } = require('../../fixtures');

test.describe('Menu Navigation', () => {
  // 2.1
  test('should open Settings panel on SETTINGS click; Timer sub-tab active by default; save button appears', async ({ popupPage }) => {
    await expect(popupPage.settingsPanel).toBeHidden();

    await popupPage.clickSettings();

    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.saveButton).toBeVisible();
    await expect(popupPage.pomoDurationInput).toBeVisible();
  });

  // 2.2
  test('should close Settings panel on second SETTINGS click; save button hides', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.saveButton).toBeVisible();

    await popupPage.clickSettings();

    await expect(popupPage.settingsPanel).toBeHidden();
    await expect(popupPage.saveButton).toBeHidden();
  });

  // 2.3
  test('should open History panel on HISTORY click', async ({ popupPage }) => {
    await popupPage.clickHistory();

    await expect(popupPage.historyPanel).toBeVisible();
    await expect(popupPage.pomoToday).toBeVisible();
    await expect(popupPage.hoursToday).toBeVisible();
    await expect(popupPage.historyChart).toBeVisible();
  });

  // 2.4
  test('should open Feedback panel with all links visible', async ({ popupPage }) => {
    await popupPage.clickFeedback();

    await expect(popupPage.feedbackPanel).toBeVisible();
    await expect(popupPage.rateAndReviewLink).toBeVisible();
    // Bug report / feature request link
    await expect(
      popupPage.feedbackPanel.locator('a[href*="github"], a[href*="bug"], a[href*="feature"]').first(),
    ).toBeVisible();
    // Wiki link
    await expect(
      popupPage.feedbackPanel.locator('a[href*="wiki"], a[href*="Wiki"]').first(),
    ).toBeVisible();
    await expect(
      popupPage.feedbackPanel.locator('a', { hasText: /pomodoro/i }).first(),
    ).toBeVisible();
  });

  // 2.5
  test('should open Donate panel with Ko-fi link visible', async ({ popupPage }) => {
    await popupPage.clickDonate();

    await expect(popupPage.donatePanel).toBeVisible();
    await expect(
      popupPage.donatePanel.locator('a[href*="ko-fi"]'),
    ).toBeVisible();
  });

  // 2.6
  test('should switch between panels: Settings → History → Feedback; each previous panel hides', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.historyPanel).toBeHidden();

    await popupPage.clickHistory();
    await expect(popupPage.historyPanel).toBeVisible();
    await expect(popupPage.settingsPanel).toBeHidden();

    await popupPage.clickFeedback();
    await expect(popupPage.feedbackPanel).toBeVisible();
    await expect(popupPage.historyPanel).toBeHidden();
  });
});
