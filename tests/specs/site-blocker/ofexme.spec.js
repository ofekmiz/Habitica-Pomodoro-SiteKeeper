const { test, expect } = require('../../fixtures/index');
const { ContentPage } = require('../../pages/contentPageModel');
const { HOST_OFEX, OFEX_DEMO_URL } = require('../../constants/testConstants');
const { injectBlockedSite, restoreUserData, removeBlockedHostname } = require('../../fixtures/userDataStorage');

test.describe('Suite 8 — Site Blocker: ofex.me', () => {
  // 8.1
  test('should show "Block Site!" when ofex.me is not blocked', async ({ popupPage, extensionContext }) => {
    // Arrange – open ofex.me tab so popup sees active hostname
    const tab = await extensionContext.newPage();
    await tab.goto(OFEX_DEMO_URL);

    // Act – reload popup to pick up active tab
    await popupPage.reloadPopup();

    // Assert
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.siteRow(HOST_OFEX)).toHaveCount(0);

    await tab.close();
  });

  // 8.2
  test('should block ofex.me: row appears, block-link changes to "Un-Block Site"', async ({ popupPage, extensionContext }) => {
    // Arrange – navigate active tab to ofex.me
    const tab = await extensionContext.newPage();
    await tab.goto(OFEX_DEMO_URL);
    await popupPage.reloadPopup();

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow(HOST_OFEX)).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);
    await expect(popupPage.welcomeInfo).toBeHidden();

    await tab.close();
    // Cleanup
    await removeBlockedHostname(popupPage.page, HOST_OFEX);
  });

  // 8.3
  test('should unblock ofex.me via block-link: row removed, link reverts to "Block Site!"', async ({ popupPage, extensionContext }) => {
    // Arrange – pre-block ofex.me
    const original = await injectBlockedSite(popupPage.page, HOST_OFEX, {
      hostname: HOST_OFEX,
      cost: 0,
      passDuration: 30,
    });
    const tab = await extensionContext.newPage();
    await tab.goto(OFEX_DEMO_URL);
    await popupPage.reloadPopup();

    // Assert initial un-block state
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow(HOST_OFEX)).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.welcomeInfo).toBeVisible();

    await tab.close();
    // Cleanup
    await restoreUserData(popupPage.page, original);
  });

  // 8.4
  test('should display blocked site row with hostname, hourglass, duration 30, edit + delete buttons; no buy button', async ({ popupPage }) => {
    // Arrange
    const original = await injectBlockedSite(popupPage.page, HOST_OFEX, {
      hostname: HOST_OFEX,
      cost: 0,
      passDuration: 30,
    });
    await popupPage.reloadPopup();

    // Assert row visible
    const row = popupPage.siteRow(HOST_OFEX);
    await expect(row).toBeVisible();

    // Assert row content
    await expect(row).toContainText(HOST_OFEX);
    await expect(row).toContainText('30');

    // Assert edit and delete buttons
    await expect(popupPage.siteRowEditButton(HOST_OFEX)).toBeVisible();
    await expect(popupPage.siteRowDeleteButton(HOST_OFEX)).toBeVisible();

    // Assert no buy-with-gold button
    await expect(
      popupPage.page.getByTestId('site-buy').and(popupPage.page.locator(`[data-hostname="${HOST_OFEX}"]`)),
    ).toHaveCount(0);

    // Cleanup
    await restoreUserData(popupPage.page, original);
  });

  // 8.5
  test('should edit pass duration to 60 via edit row; persists after reload', async ({ popupPage }) => {
    // Arrange
    const original = await injectBlockedSite(popupPage.page, HOST_OFEX, {
      hostname: HOST_OFEX,
      cost: 0,
      passDuration: 30,
    });
    await popupPage.reloadPopup();

    // Act – open edit row
    await popupPage.siteRowEditButton(HOST_OFEX).click();

    // Fill new duration
    const input = popupPage.siteRowPassDurationInput(HOST_OFEX);
    await input.fill('60');
    await input.press('Enter');

    // Assert edit row closed and duration updated
    const row = popupPage.siteRow(HOST_OFEX);
    await expect(row).toContainText('60');

    // Reload and verify persistence
    await popupPage.reloadPopup();
    await expect(popupPage.siteRow(HOST_OFEX)).toContainText('60');

    // Cleanup
    await restoreUserData(popupPage.page, original);
  });

  // 8.6
  test('should delete blocked site via trash button: row removed, link reverts, removed after reload', async ({ popupPage }) => {
    // Arrange
    const original = await injectBlockedSite(popupPage.page, HOST_OFEX, {
      hostname: HOST_OFEX,
      cost: 0,
      passDuration: 30,
    });
    await popupPage.reloadPopup();

    // Act
    await popupPage.siteRowDeleteButton(HOST_OFEX).click();

    // Assert immediately
    await expect(popupPage.siteRow(HOST_OFEX)).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.welcomeInfo).toBeVisible();

    // Assert after reload
    await popupPage.reloadPopup();
    await expect(popupPage.siteRow(HOST_OFEX)).toHaveCount(0);

    // Cleanup
    await restoreUserData(popupPage.page, original);
  });

  // 8.7 — class `blocked` is on the site-table tbody (see popup.js), not on inner cells.
  test('should apply "blocked" CSS class during pomodoro, remove during break', async ({
    popupPageShortTimerWithOfexBlocked: { popupPage },
  }) => {
    const row = popupPage.siteRow(HOST_OFEX);

    await popupPage.clickPomoButton();

    await expect(row).toHaveClass(/blocked/);

    await popupPage.waitForPomoButtonClass('tomatoBreak');

    await expect(row).not.toHaveClass(/blocked/);

    await popupPage.clickPomoStop();
  });

  // 8.8 — service worker injects body.blockedSite + data-html while pomodoro runs (mainSiteBlockFunction path).
  test('should show Stay Focused overlay on ofex.me tab during pomodoro', async ({
    popupPageShortTimerWithOfexBlocked: { popupPage, activePage },
  }) => {
    const content = new ContentPage(activePage);

    await activePage.bringToFront();
    await popupPage.clickPomoButton();
    await activePage.bringToFront();

    await expect(content.body).toHaveClass(/blockedSite/, { timeout: 20_000 });
    await expect(content.body).toHaveAttribute('data-html', /Stay Focused! Time Left:/);

    // During pomodoro the X (End session) control is hidden; interrupt via second tomato click.
    await popupPage.clickPomoButton();
  });
});
