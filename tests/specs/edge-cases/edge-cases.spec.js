const { test, expect } = require('../../fixtures/index');
const { HOST_OFEX } = require('../../constants/testConstants');
const { parseTimerDisplayToSeconds } = require('../../utils/timerDisplay');

test.describe('Edge Cases', () => {
  // 11.1 — Invalid pomo duration: updateCredentials() only assigns when parseFloat is finite (popup.js).
  test('should reject invalid pomo duration ("abc"): previous valid value retained, no JS errors', async ({
    popupPage,
    noConsoleErrors,
  }) => {
    await popupPage.openSettingsTimerTab();
    const validValue = await popupPage.pomoDurationInput.inputValue();

    await popupPage.pomoDurationInput.fill('abc');
    await popupPage.saveButton.click();

    await popupPage.reloadPopup();
    await popupPage.openSettingsTimerTab();
    await expect(popupPage.pomoDurationInput).toHaveValue(validValue);
  });

  // 11.2 — the fixture opens a real tab to ofex.me and makes it the browser's
  // active tab before reloading the popup, so the popup sees ofex.me as the
  test('should reject invalid pass duration ("abc") on blocked site edit row; no JS errors', async ({
    popupPageWithOfexBlocked,
    noConsoleErrorsWithOfexBlocked,
  }) => {
    const { popupPage } = popupPageWithOfexBlocked;

    await popupPage.patchUserData({ ConnectHabitica: true });
    await popupPage.reloadPopup();

    await popupPage.blockLink.click();
    await popupPage.clickSiteRowEditButton(HOST_OFEX);
    const input = popupPage.siteRowPassDurationInput(HOST_OFEX);
    await input.waitFor({ state: 'visible' });
    await input.fill('abc');
    await input.press('Enter');

    // Pass duration unchanged when parseFloat is NaN (updateSiteCostDuration in popup.js).
    const row = popupPage.siteRow(HOST_OFEX);
    await expect(row).toContainText('30');
  });

  // 11.3
  test('should handle 5 rapid tomato clicks with no JS errors and consistent timer state', async ({
    popupPage,
    noConsoleErrors,
  }) => {
    await popupPage.resetTimerState();

    // Act – 5 rapid clicks
    for (let i = 0; i < 5; i++) {
      await popupPage.clickPomoButton();
    }

    const pomoClass = await popupPage.pomoButton.getAttribute('class');
    expect(pomoClass).toMatch(/tomatoWait|tomatoProgress/);

    const timerText = await popupPage.getTimerText();
    expect(timerText).toMatch(/^\d{2}:\d{2}$/);
    parseTimerDisplayToSeconds(timerText);
  });

  // 11.4
  test('should persist timer state across popup close and reopen', async ({ newPopupPage }) => {
    const popupPage1 = await newPopupPage();

    await popupPage1.resetTimerState();
    await popupPage1.clickPomoButton();
    await popupPage1.waitForPomoButtonClass('tomatoProgress');
    await expect(popupPage1.pomoButton).toHaveClass(/tomatoProgress/);
    const timerBefore = await popupPage1.getTimerText();

    await popupPage1.page.close();

    const popupPage2 = await newPopupPage();

    await popupPage2.waitForPomoButtonClass('tomatoProgress');
    await expect(popupPage2.pomoButton).toHaveClass(/tomatoProgress/);
    await expect
      .poll(async () => popupPage2.getTimerText(), { timeout: 15_000 })
      .not.toBe(timerBefore);

    const timerAfter = await popupPage2.getTimerText();
    expect(timerAfter).toMatch(/^\d{2}:\d{2}$/);
    parseTimerDisplayToSeconds(timerAfter);

    // Cleanup
    await popupPage2.clickPomoButton();
  });
});
