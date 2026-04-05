const { test, expect } = require('../../fixtures');

/** Helper: inject localhost into BlockedSites storage. */
async function blockLocalhost(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ BlockedSites: { localhost: { passDuration: 30 } } }, resolve);
    });
  });
}

/** Helper: clear BlockedSites from storage. */
async function clearBlockedSites(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.remove('BlockedSites', resolve);
    });
  });
}

test.describe('Site Blocker: localhost (non-real site)', () => {
  // 9.1
  test('should show "Block Site!" when localhost is not blocked', async ({ popupPage, extensionContext }) => {
    // Arrange – open localhost tab (ignore connection errors)
    const tab = await extensionContext.newPage();
    await tab.goto('http://localhost/').catch(() => {});
    await popupPage.reloadPopup();

    // Assert
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    await expect(popupPage.siteRow('localhost')).toHaveCount(0);

    await tab.close();
  });

  // 9.2
  test('should block localhost: row appears, link changes to "Un-Block Site", no console errors', async ({ popupPage, extensionContext }) => {
    // Arrange – open localhost tab
    const tab = await extensionContext.newPage();
    await tab.goto('http://localhost/').catch(() => {});
    await popupPage.reloadPopup();

    // Capture console errors
    const consoleErrors = [];
    popupPage.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow('localhost')).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);
    expect(consoleErrors).toHaveLength(0);

    await tab.close();
    // Cleanup
    await clearBlockedSites(popupPage.page);
  });

  // 9.3
  test('should unblock localhost via block-link: row removed, link reverts, no JS errors', async ({ popupPage, extensionContext }) => {
    // Arrange
    await blockLocalhost(popupPage.page);
    const tab = await extensionContext.newPage();
    await tab.goto('http://localhost/').catch(() => {});
    await popupPage.reloadPopup();

    const consoleErrors = [];
    popupPage.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Assert initial state
    await expect(popupPage.blockLink).toHaveText(/Un-Block Site/i);

    // Act
    await popupPage.blockLink.click();

    // Assert
    await expect(popupPage.siteRow('localhost')).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    expect(consoleErrors).toHaveLength(0);

    await tab.close();
  });

  // 9.4
  test('should delete localhost via trash button: row removed, link reverts, no JS errors', async ({ popupPage }) => {
    // Arrange
    await blockLocalhost(popupPage.page);
    await popupPage.reloadPopup();

    const consoleErrors = [];
    popupPage.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Act
    await popupPage.siteRowDeleteButton('localhost').click();

    // Assert
    await expect(popupPage.siteRow('localhost')).toHaveCount(0);
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
    expect(consoleErrors).toHaveLength(0);
  });
});
