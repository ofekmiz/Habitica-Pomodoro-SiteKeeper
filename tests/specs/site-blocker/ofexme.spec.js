const { test, expect } = require('../../fixtures');
const { test: fixtureTest } = require('../../fixtures/index');

/** Helper: inject ofex.me into BlockedSites storage. */
async function blockOfexMe(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ BlockedSites: { 'ofex.me': { passDuration: 30 } } }, resolve);
    });
  });
}

/** Helper: remove BlockedSites from storage. */
async function clearBlockedSites(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.remove('BlockedSites', resolve);
    });
  });
}

test.describe('Suite 8 — Site Blocker: ofex.me', () => {
  // 8.1
  test('should show "Block Site!" when ofex.me is not blocked', async ({ popupPage, extensionContext }) => {
    // Arrange – open ofex.me tab so popup sees active hostname
    const tab = await extensionContext.newPage();
    await tab.goto('https://ofex.me/animation-timer/');

    // Act – reload popup to pick up active tab
    await popupPage.reloadPopup();

    // Assert
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.siteRow('ofex.me')).toHaveCount(0);

    await tab.close();
  });

  // 8.2
  test('should block ofex.me: row appears, block-link changes to "Un-Block Site"', async ({ popupPage, extensionContext }) => {
    // Arrange – navigate active tab to ofex.me
    const tab = await extensionContext.newPage();
    await tab.goto('https://ofex.me/animation-timer/');
    await popupPage.reloadPopup();

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow('ofex.me')).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);
    await expect(popupPage.welcomeInfo).toBeHidden();

    await tab.close();
    // Cleanup
    await clearBlockedSites(popupPage.page);
  });

  // 8.3
  test('should unblock ofex.me via block-link: row removed, link reverts to "Block Site!"', async ({ popupPage, extensionContext }) => {
    // Arrange – pre-block ofex.me
    await blockOfexMe(popupPage.page);
    const tab = await extensionContext.newPage();
    await tab.goto('https://ofex.me/animation-timer/');
    await popupPage.reloadPopup();

    // Assert initial un-block state
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow('ofex.me')).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.welcomeInfo).toBeVisible();

    await tab.close();
  });

  // 8.4
  test('should display blocked site row with hostname, hourglass, duration 30, edit + delete buttons; no buy button', async ({ popupPage }) => {
    // Arrange
    await blockOfexMe(popupPage.page);
    await popupPage.reloadPopup();

    // Assert row visible
    const row = popupPage.siteRow('ofex.me');
    await expect(row).toBeVisible();

    // Assert row content
    await expect(row).toContainText('ofex.me');
    await expect(row).toContainText('30');

    // Assert edit and delete buttons
    await expect(popupPage.siteRowEditButton('ofex.me')).toBeVisible();
    await expect(popupPage.siteRowDeleteButton('ofex.me')).toBeVisible();

    // Assert no buy-with-gold button
    await expect(popupPage.page.getByTestId('site-buy').and(popupPage.page.locator('[data-hostname="ofex.me"]'))).toHaveCount(0);

    // Cleanup
    await clearBlockedSites(popupPage.page);
  });

  // 8.5
  test('should edit pass duration to 60 via edit row; persists after reload', async ({ popupPage }) => {
    // Arrange
    await blockOfexMe(popupPage.page);
    await popupPage.reloadPopup();

    // Act – open edit row
    await popupPage.siteRowEditButton('ofex.me').click();

    // Fill new duration
    const input = popupPage.siteRowPassDurationInput('ofex.me');
    await input.fill('60');
    await input.press('Enter');

    // Assert edit row closed and duration updated
    const row = popupPage.siteRow('ofex.me');
    await expect(row).toContainText('60');

    // Reload and verify persistence
    await popupPage.reloadPopup();
    await expect(popupPage.siteRow('ofex.me')).toContainText('60');

    // Cleanup
    await clearBlockedSites(popupPage.page);
  });

  // 8.6
  test('should delete blocked site via trash button: row removed, link reverts, removed after reload', async ({ popupPage }) => {
    // Arrange
    await blockOfexMe(popupPage.page);
    await popupPage.reloadPopup();

    // Act
    await popupPage.siteRowDeleteButton('ofex.me').click();

    // Assert immediately
    await expect(popupPage.siteRow('ofex.me')).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.welcomeInfo).toBeVisible();

    // Assert after reload
    await popupPage.reloadPopup();
    await expect(popupPage.siteRow('ofex.me')).toHaveCount(0);
  });

  // 8.7
  test('should apply "blocked" CSS class during pomodoro, remove during break', async ({ popupPage }) => {
    // Arrange – short pomo and ofex blocked
    await blockOfexMe(popupPage.page);
    await popupPage.page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.set({ PomoDuration: 1, BreakDuration: 1 }, resolve);
      });
    });
    await popupPage.reloadPopup();

    // Act – start timer
    await popupPage.clickPomoButton();

    // Assert 'blocked' class applied
    const row = popupPage.siteRow('ofex.me');
    await expect(row).toHaveClass(/blocked/);

    // Wait for break
    await popupPage.waitForPomoButtonClass('tomatoBreak', 75_000);

    // Assert 'blocked' class removed during break
    await expect(row).not.toHaveClass(/blocked/);

    // Cleanup
    await popupPage.clickPomoStop();
    await clearBlockedSites(popupPage.page);
    await popupPage.page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.remove(['PomoDuration', 'BreakDuration'], resolve);
      });
    });
  });
});
