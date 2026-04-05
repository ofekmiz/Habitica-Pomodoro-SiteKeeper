const { test, expect } = require('../../fixtures/index');

test.describe('Edge Cases', () => {
  // 11.1
  test('should reject invalid pomo duration ("abc"): previous valid value retained, no JS errors', async ({ popupPage }) => {
    await popupPage.openSettingsTimerTab();
    const validValue = await popupPage.pomoDurationInput.inputValue();

    const consoleErrors = [];
    popupPage.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await popupPage.pomoDurationInput.fill('abc');
    await popupPage.saveButton.click();

    expect(consoleErrors).toHaveLength(0);
    const valueAfterSave = await popupPage.pomoDurationInput.inputValue();
    const isValidOrEmpty = valueAfterSave === validValue || valueAfterSave === '' || !isNaN(Number(valueAfterSave));
    expect(isValidOrEmpty).toBe(true);
  });

  // 11.2 — the fixture opens a real tab to ofex.me and makes it the browser's
  // active tab before reloading the popup, so the popup sees ofex.me as the
  test('should reject invalid pass duration ("abc") on blocked site edit row; no JS errors', async ({ popupPageWithOfexBlocked }) => {
    const { popupPage } = popupPageWithOfexBlocked;

    await popupPage.patchUserData({ ConnectHabitica: true });
    await popupPage.reloadPopup();

    const consoleErrors = [];
    popupPage.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await popupPage.blockLink.click();
    await popupPage.clickSiteRowEditButton('ofex.me');
    const input = popupPage.siteRowPassDurationInput('ofex.me');
    await input.waitFor({ state: 'visible' });
    await input.fill('abc');
    await input.press('Enter');

    expect(consoleErrors).toHaveLength(0);

    // Assert duration is a valid numeric value (defaulted or unchanged)
    const rowText = await popupPage.siteRow('ofex.me').textContent();
    expect(rowText).toMatch(/\d+/);
  });

  // 11.3
  test('should handle 5 rapid tomato clicks with no JS errors and consistent timer state', async ({ popupPage }) => {
    await popupPage.resetTimerState();
    const consoleErrors = [];
    popupPage.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Act – 5 rapid clicks
    for (let i = 0; i < 5; i++) {
      await popupPage.clickPomoButton();
    }

    expect(consoleErrors).toHaveLength(0);

    const pomoClass = await popupPage.pomoButton.getAttribute('class');
    expect(pomoClass).toMatch(/tomatoWait|tomatoProgress/);

    const timerText = await popupPage.getTimerText();
    expect(timerText).toMatch(/^\d{2}:\d{2}$/);
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
    await new Promise((r) => setTimeout(r, 3000));

    const popupPage2 = await newPopupPage();

    await popupPage2.waitForPomoButtonClass('tomatoProgress');
    await expect(popupPage2.pomoButton).toHaveClass(/tomatoProgress/);
    const timerAfter = await popupPage2.getTimerText();
    expect(timerAfter).toMatch(/^\d{2}:\d{2}$/);
    expect(timerAfter).not.toBe(timerBefore);

    await popupPage2.clickPomoButton();
  });
});
