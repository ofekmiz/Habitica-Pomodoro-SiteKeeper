/**
 * Page Object Model for the extension popup.
 *
 * All locators are exposed as getters so they are lazily evaluated and always
 * reference the live page. Action methods encapsulate multi-step interactions
 * that would otherwise be repeated across tests.
 */
class PopupPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  get mainContainer() {
    return this.page.getByTestId('main-container');
  }

  // ---------------------------------------------------------------------------
  // Menu items
  // ---------------------------------------------------------------------------

  get menuSettings() {
    return this.page.getByTestId('menu-settings');
  }

  get menuHistory() {
    return this.page.getByTestId('menu-history');
  }

  get menuFeedback() {
    return this.page.getByTestId('menu-feedback');
  }

  get menuDonate() {
    return this.page.getByTestId('menu-donate');
  }

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------

  get pomodoroSection() {
    return this.page.getByTestId('pomodoro-section');
  }

  get pomoButton() {
    return this.page.getByTestId('pomo-button');
  }

  get timerDisplay() {
    return this.page.getByTestId('timer-display');
  }

  get quickSettings() {
    return this.page.getByTestId('quick-settings');
  }

  async getTimerText() {
    return this.timerDisplay.textContent();
  }

  // ---------------------------------------------------------------------------
  // Site blocker
  // ---------------------------------------------------------------------------

  get blockLink() {
    return this.page.getByTestId('block-link');
  }

  get siteTable() {
    return this.page.getByTestId('site-table');
  }

  // ---------------------------------------------------------------------------
  // Panels
  // ---------------------------------------------------------------------------

  get settingsPanel() {
    return this.page.getByTestId('settings-panel');
  }

  get historyPanel() {
    return this.page.getByTestId('history-panel');
  }

  get feedbackPanel() {
    return this.page.getByTestId('feedback-panel');
  }

  // ---------------------------------------------------------------------------
  // Settings – inner-menu tabs (CSS-hidden radio inputs)
  // ---------------------------------------------------------------------------

  get innerMenuTimer() {
    return this.page.getByTestId('inner-menu-timer');
  }

  get innerMenuHabitica() {
    return this.page.getByTestId('inner-menu-habitica');
  }

  get innerMenuBlocker() {
    return this.page.getByTestId('inner-menu-blocker');
  }

  // ---------------------------------------------------------------------------
  // Settings – Timer sub-tab inputs
  // ---------------------------------------------------------------------------

  get pomoDurationInput() {
    return this.page.getByTestId('pomo-duration');
  }

  get breakDurationInput() {
    return this.page.getByTestId('break-duration');
  }

  get longBreakDurationInput() {
    return this.page.getByTestId('long-break-duration');
  }

  get breakExtensionInput() {
    return this.page.getByTestId('break-extension');
  }

  get pomoSetNumInput() {
    return this.page.getByTestId('pomo-set-num');
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save/i });
  }

  // ---------------------------------------------------------------------------
  // Settings – Habitica sub-tab inputs
  // ---------------------------------------------------------------------------

  get uidInput() {
    return this.page.getByTestId('uid');
  }

  get apiTokenInput() {
    return this.page.getByTestId('api-token');
  }

  // ---------------------------------------------------------------------------
  // Settings – Blocker sub-tab inputs
  // ---------------------------------------------------------------------------

  get whitelistTextarea() {
    return this.page.getByTestId('whitelist');
  }

  // ---------------------------------------------------------------------------
  // History panel
  // ---------------------------------------------------------------------------

  get pomoToday() {
    return this.page.getByTestId('pomo-today');
  }

  get hoursToday() {
    return this.page.getByTestId('hours-today');
  }

  get pomoTotal() {
    return this.page.getByTestId('pomo-total');
  }

  get hoursTotal() {
    return this.page.getByTestId('hours-total');
  }

  get historyChart() {
    return this.page.getByTestId('history-chart');
  }

  get fullHistoryLink() {
    return this.page.getByRole('link', { name: /full history/i });
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Open (or toggle closed) the Settings panel. */
  async clickSettings() {
    await this.page.getByTestId('menu-settings-trigger').click();
  }

  /** Open the History panel. */
  async clickHistory() {
    await this.page.getByTestId('menu-history-trigger').click();
  }

  /** Open the Feedback panel. */
  async clickFeedback() {
    await this.page.getByTestId('menu-feedback-trigger').click();
  }

  /**
   * Switch to the Habitica inner-tab inside the Settings panel.
   * Uses evaluate() because the radio input is CSS-hidden and Playwright's
   * normal click() requires the element to be visible.
   */
  async switchToHabiticaTab() {
    await this.innerMenuHabitica.evaluate((el) => el.click());
  }

  /**
   * Switch to the Blocker inner-tab inside the Settings panel.
   * Same visibility caveat as switchToHabiticaTab().
   */
  async switchToBlockerTab() {
    await this.innerMenuBlocker.evaluate((el) => el.click());
  }
}

module.exports = { PopupPage };
