const { test, expect } = require('./fixtures');

// ---------------------------------------------------------------------------
// Structure & initial render
// ---------------------------------------------------------------------------
test.describe('Popup – structure', () => {
  test('has the correct page title', async ({ popupPage }) => {
    await expect(popupPage.page).toHaveTitle('Habitica SiteKeeper');
  });

  test('main container is present', async ({ popupPage }) => {
    await expect(popupPage.mainContainer).toBeVisible();
  });

  test('all four menu items are visible', async ({ popupPage }) => {
    await expect(popupPage.menuSettings).toBeVisible();
    await expect(popupPage.menuHistory).toBeVisible();
    await expect(popupPage.menuFeedback).toBeVisible();
    await expect(popupPage.menuDonate).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Pomodoro timer section
// ---------------------------------------------------------------------------
test.describe('Popup – timer', () => {
  test('timer section is visible', async ({ popupPage }) => {
    await expect(popupPage.pomodoroSection).toBeVisible();
  });

  test('tomato button is present', async ({ popupPage }) => {
    await expect(popupPage.pomoButton).toBeVisible();
  });

  test('timer display shows a MM:SS format', async ({ popupPage }) => {
    const timeText = await popupPage.getTimerText();
    expect(timeText).toMatch(/^\d{2}:\d{2}$/);
  });

  test('quick-settings gear is visible when timer is idle', async ({ popupPage }) => {
    await expect(popupPage.quickSettings).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Site blocker section
// ---------------------------------------------------------------------------
test.describe('Popup – site blocker', () => {
  test('Block Site link is visible', async ({ popupPage }) => {
    await expect(popupPage.blockLink).toBeVisible();
  });

  test('blocked sites table is present in the DOM', async ({ popupPage }) => {
    await expect(popupPage.siteTable).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Menu navigation
// ---------------------------------------------------------------------------
test.describe('Popup – menu navigation', () => {
  test('clicking SETTINGS reveals the settings panel and save button', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.saveButton).toBeVisible();
  });

  test('clicking SETTINGS again (toggle) hides the panel', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await expect(popupPage.settingsPanel).toBeVisible();
    await popupPage.clickSettings();
    await expect(popupPage.settingsPanel).toBeHidden();
  });

  test('clicking HISTORY reveals the history panel', async ({ popupPage }) => {
    await popupPage.clickHistory();
    await expect(popupPage.historyPanel).toBeVisible();
  });

  test('clicking FEEDBACK reveals the feedback panel', async ({ popupPage }) => {
    await popupPage.clickFeedback();
    await expect(popupPage.feedbackPanel).toBeVisible();
  });

  test('only one panel is visible at a time', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.historyPanel).toBeHidden();

    await popupPage.clickHistory();
    await expect(popupPage.historyPanel).toBeVisible();
    await expect(popupPage.settingsPanel).toBeHidden();
  });
});

// ---------------------------------------------------------------------------
// Settings panel – timer sub-tab
// ---------------------------------------------------------------------------
test.describe('Popup – settings panel', () => {
  test('timer settings inputs are present', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await expect(popupPage.pomoDurationInput).toBeVisible();
    await expect(popupPage.breakDurationInput).toBeVisible();
    await expect(popupPage.longBreakDurationInput).toBeVisible();
    await expect(popupPage.breakExtensionInput).toBeVisible();
    await expect(popupPage.pomoSetNumInput).toBeVisible();
  });

  test('timer settings show inner-menu tabs (TIMER / HABITICA / BLOCKER)', async ({ popupPage }) => {
    await popupPage.clickSettings();
    // Radio inputs are CSS-hidden; toBeAttached() verifies presence in the DOM
    await expect(popupPage.innerMenuTimer).toBeAttached();
    await expect(popupPage.innerMenuHabitica).toBeAttached();
    await expect(popupPage.innerMenuBlocker).toBeAttached();
  });

  test('Habitica inner-tab shows UID and API Token inputs', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await popupPage.switchToHabiticaTab();
    await expect(popupPage.uidInput).toBeVisible();
    await expect(popupPage.apiTokenInput).toBeVisible();
  });

  test('Blocker inner-tab shows Whitelist textarea', async ({ popupPage }) => {
    await popupPage.clickSettings();
    await popupPage.switchToBlockerTab();
    await expect(popupPage.whitelistTextarea).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// History panel
// ---------------------------------------------------------------------------
test.describe('Popup – history panel', () => {
  test('history stats circles are present', async ({ popupPage }) => {
    await popupPage.clickHistory();
    await expect(popupPage.pomoToday).toBeVisible();
    await expect(popupPage.hoursToday).toBeVisible();
    await expect(popupPage.pomoTotal).toBeVisible();
    await expect(popupPage.hoursTotal).toBeVisible();
  });

  test('history chart canvas is present', async ({ popupPage }) => {
    await popupPage.clickHistory();
    await expect(popupPage.historyChart).toBeAttached();
  });

  test('"Full History & Backup" link is present', async ({ popupPage }) => {
    await popupPage.clickHistory();
    await expect(popupPage.fullHistoryLink).toBeVisible();
  });
});
