const { expect } = require('@playwright/test');
const { syncServiceWorkerFromStorage } = require('../fixtures/userDataStorage');

/**
 * Page Object Model for the extension popup.
 *
 * All locators are exposed as getters so they are lazily evaluated and always
 * reference the live page. Action methods encapsulate multi-step interactions
 * that would otherwise be repeated across tests.
 *
 * Prefer `data-testid` for stable hooks. Native `<button>` / `<a>` and
 * `role="button"` controls use getByRole with accessible name when available.
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

  get menuContainer() {
    return this.page.getByTestId('menu-container');
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

  /** Gear icon that opens the quick-settings overlay (visible when timer is idle). */
  get quickSettings() {
    return this.page.getByRole('button', { name: 'Timer quick settings' });
  }

  /** X / end session — role="button" aria-label="End session". */
  get pomoStop() {
    return this.page.getByRole('button', { name: 'End session' });
  }

  /** >> skip to break — role="button" aria-label="Skip to break". */
  get skipToBreak() {
    return this.page.getByRole('button', { name: 'Skip to break' });
  }

  /** Snowflake freeze — role="button" aria-label="Freeze pomodoro". */
  get pomoFreeze() {
    return this.page.getByRole('button', { name: 'Freeze pomodoro' });
  }

  /** Open popup in new window — role="button" aria-label="Open popup in new window". */
  get popupNewWindow() {
    return this.page.getByRole('button', { name: 'Open popup in new window' });
  }

  async getTimerText() {
    return this.timerDisplay.textContent();
  }

  // ---------------------------------------------------------------------------
  // Quick-settings overlay
  // ---------------------------------------------------------------------------

  /** The full quick-settings panel (distinct from the gear icon trigger). */
  get quickSettingsPanel() {
    return this.page.getByTestId('quick-settings-panel');
  }

  get quickSetPomoDuration() {
    return this.page.getByTestId('quick-set-pomo-duration');
  }

  get quickSetBreakDuration() {
    return this.page.getByTestId('quick-set-break-duration');
  }

  get quickSetLongBreakDuration() {
    return this.page.getByTestId('quick-set-long-break-duration');
  }

  get quickSetPomoSetNum() {
    return this.page.getByTestId('quick-set-pomo-set-num');
  }

  get quickSetTakeBreakDuration() {
    return this.page.getByTestId('quick-set-take-break-duration');
  }

  /** Arrow button that starts the manual break from the quick-settings panel. */
  get quickSetTakeBreak() {
    return this.page.getByTestId('quick-set-take-break');
  }

  /** OK button that saves quick settings and returns to the timer view. */
  get quickSave() {
    return this.page.getByRole('button', { name: 'Ok' });
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

  /** Welcome info paragraph shown inside the site table when no sites are blocked. */
  get welcomeInfo() {
    return this.page.getByTestId('welcome-info');
  }

  /** Vacation-mode banner shown across the popup when vacation mode is active. */
  get vacationBanner() {
    return this.page.getByTestId('vacation-banner');
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

  /** Donate / Coffee panel. */
  get donatePanel() {
    return this.page.getByTestId('donate-panel');
  }

  // ---------------------------------------------------------------------------
  // Alerts
  // ---------------------------------------------------------------------------

  /** Credential-error alert shown when Habitica API calls fail (401). */
  get credError() {
    return this.page.getByTestId('cred-error');
  }

  /** Version-update notification banner. */
  get versionUpdate() {
    return this.page.getByTestId('version-update');
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

  get showSkipToBreakCheckbox() {
    return this.page.getByTestId('show-skip-to-break');
  }

  /** Click target for Skip to break (native checkbox is CSS-hidden). */
  get showSkipToBreakLabel() {
    return this.page.getByTestId('label-show-skip-to-break');
  }

  get showFreezeCheckbox() {
    return this.page.getByTestId('show-freeze');
  }

  /** Click target for Freeze pomodoro (native checkbox is CSS-hidden). */
  get showFreezeLabel() {
    return this.page.getByTestId('label-show-freeze');
  }

  get manualBreakCheckbox() {
    return this.page.getByTestId('manual-break');
  }

  get manualBreakLabel() {
    return this.page.getByTestId('label-manual-break');
  }

  get resetPomoAfterBreakCheckbox() {
    return this.page.getByTestId('reset-pomo-after-break');
  }

  get resetPomoAfterBreakLabel() {
    return this.page.getByTestId('label-reset-pomo-after-break');
  }

  /** @param {boolean} checked */
  async setShowSkipToBreak(checked) {
    if ((await this.showSkipToBreakCheckbox.isChecked()) !== checked) {
      await this.showSkipToBreakLabel.click();
    }
  }

  /** @param {boolean} checked */
  async setShowFreeze(checked) {
    if ((await this.showFreezeCheckbox.isChecked()) !== checked) {
      await this.showFreezeLabel.click();
    }
  }

  get pomodoroEndSoundSelect() {
    return this.page.getByTestId('pomodoro-end-sound');
  }

  get pomodoroEndSoundVolumeSlider() {
    return this.page.getByTestId('pomodoro-end-sound-volume');
  }

  get breakEndSoundSelect() {
    return this.page.getByTestId('break-end-sound');
  }

  get breakEndSoundVolumeSlider() {
    return this.page.getByTestId('break-end-sound-volume');
  }

  get ambientSoundSelect() {
    return this.page.getByTestId('ambient-sound');
  }

  get ambientSoundVolumeSlider() {
    return this.page.getByTestId('ambient-sound-volume');
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /SAVE|CLOSE/ });
  }

  // ---------------------------------------------------------------------------
  // Settings – Habitica sub-tab inputs
  // ---------------------------------------------------------------------------

  get connectHabiticaToggle() {
    return this.page.getByTestId('connect-habitica');
  }

  /** Click target for the Connect Habitica switch (native checkbox is CSS-hidden). */
  get connectHabiticaLabel() {
    return this.page.getByTestId('label-connect-habitica');
  }

  get uidInput() {
    return this.page.getByTestId('uid');
  }

  get apiTokenInput() {
    return this.page.getByTestId('api-token');
  }

  get pomoHabitPlusCheckbox() {
    return this.page.getByTestId('pomo-habit-plus');
  }

  get pomoHabitMinusCheckbox() {
    return this.page.getByTestId('pomo-habit-minus');
  }

  get breakExtensionFailsCheckbox() {
    return this.page.getByTestId('break-extension-fails');
  }

  get pomoSetHabitPlusCheckbox() {
    return this.page.getByTestId('pomo-set-habit-plus');
  }

  get breakExtensionNotifyCheckbox() {
    return this.page.getByTestId('break-extension-notify');
  }

  get longBreakNotifyCheckbox() {
    return this.page.getByTestId('long-break-notify');
  }

  /** All elements that fade to opacity 0.3 when ConnectHabitica is OFF. */
  get habiticaSettings() {
    return this.page.locator('.habitica-setting');
  }

  // ---------------------------------------------------------------------------
  // Settings – Blocker sub-tab inputs
  // ---------------------------------------------------------------------------

  get whitelistTextarea() {
    return this.page.getByTestId('whitelist');
  }

  get breakFreePassCheckbox() {
    return this.page.getByTestId('break-free-pass');
  }

  get hideEditCheckbox() {
    return this.page.getByTestId('hide-edit');
  }

  get muteBlockedSitesCheckbox() {
    return this.page.getByTestId('mute-blocked-sites');
  }

  get transparentOverlayCheckbox() {
    return this.page.getByTestId('transparent-overlay');
  }

  get hideEditLabel() {
    return this.page.getByTestId('label-hide-edit');
  }

  get muteBlockedSitesLabel() {
    return this.page.getByTestId('label-mute-blocked-sites');
  }

  get transparentOverlayLabel() {
    return this.page.getByTestId('label-transparent-overlay');
  }

  get breakFreePassLabel() {
    return this.page.getByTestId('label-break-free-pass');
  }

  /** @param {boolean} checked */
  async setHideEdit(checked) {
    if ((await this.hideEditCheckbox.isChecked()) !== checked) {
      await this.hideEditLabel.click();
    }
  }

  get vacationModeToggle() {
    return this.page.getByTestId('vacation-mode');
  }

  /** Container holding all added free-pass schedule blocks. */
  get freePassBlocks() {
    return this.page.getByTestId('free-pass-blocks');
  }

  /** "Add Free Pass Time" button inside the Blocker settings tab. */
  get addFreePassBlock() {
    return this.page.getByTestId('add-free-pass-block');
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

  get pomoAvg() {
    return this.page.getByTestId('pomo-avg');
  }

  get hoursAvg() {
    return this.page.getByTestId('hours-avg');
  }

  get historyChart() {
    return this.page.getByTestId('history-chart');
  }

  get historyChartShowPomodoros() {
    return this.page.getByRole('button', { name: 'Pomodoros' });
  }

  get historyChartShowHours() {
    return this.page.getByRole('button', { name: 'Hours' });
  }

  get historyChartPrev() {
    return this.page.getByTestId('history-chart-prev');
  }

  get historyChartNext() {
    return this.page.getByTestId('history-chart-next');
  }

  /** Summary label below the chart (e.g. "Sum: X | Avg: Y"). */
  get historyChartTotal() {
    return this.page.getByTestId('history-chart-total');
  }

  /** "Full History & Backup" link that opens fullHistory.html. */
  get fullHistoryLink() {
    return this.page.getByRole('link', { name: /Full History/i });
  }

  /** Backup-data warning note shown at the top of the history panel. */
  get backupDataWarning() {
    return this.page.getByTestId('backup-data-warning');
  }

  get downloadHistogram() {
    return this.page.getByTestId('download-histogram');
  }

  get importHistogramFile() {
    return this.page.getByTestId('import-histogram-file');
  }

  get importHistogramButton() {
    return this.page.getByRole('button', { name: /Import/ });
  }

  get clearHistogram() {
    return this.page.getByRole('button', { name: /Clear History/i });
  }

  // ---------------------------------------------------------------------------
  // Footer (visible only when ConnectHabitica is ON)
  // ---------------------------------------------------------------------------

  get footer() {
    return this.page.getByTestId('footer');
  }

  get dosh() {
    return this.page.getByTestId('dosh');
  }

  get myHp() {
    return this.page.getByTestId('my-hp');
  }

  get refreshStats() {
    return this.page.getByTestId('refresh-stats');
  }

  // ---------------------------------------------------------------------------
  // Feedback panel links
  // ---------------------------------------------------------------------------

  get rateAndReviewLink() {
    return this.page.getByRole('link', { name: /Rate.*Review/i });
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

  /** Open the History panel and wait until it is visible. */
  async openHistoryPanel() {
    await this.clickHistory();
    await this.historyPanel.waitFor({ state: 'visible' });
  }

  /** Open the Feedback panel. */
  async clickFeedback() {
    await this.page.getByTestId('menu-feedback-trigger').click();
  }

  /** Open the Donate / Coffee panel. */
  async clickDonate() {
    await this.page.getByTestId('menu-donate-trigger').click();
  }

  /** Start (or resume) the pomodoro timer. */
  async clickPomoButton() {
    await this.pomoButton.click();
  }

  /** Click the gear icon to open the quick-settings overlay. */
  async openQuickSettings() {
    await this.quickSettings.click();
  }

  /** Save quick settings and return to the timer view. */
  async saveQuickSettings() {
    await this.quickSave.click();
  }

  /**
   * Switch to the Habitica inner-tab inside the Settings panel.
   * Clicks the visible tab control (radio inputs are display:none).
   */
  async switchToHabiticaTab() {
    await this.page.getByTestId('inner-tab-habitica').click();
  }

  /**
   * Switch to the Blocker inner-tab inside the Settings panel.
   */
  async switchToBlockerTab() {
    await this.page.getByTestId('inner-tab-blocker').click();
  }

  /**
   * Switch to the Timer inner-tab inside the Settings panel.
   */
  async switchToTimerTab() {
    await this.page.getByTestId('inner-tab-timer').click();
  }

  /**
   * Toggle the Connect Habitica switch (Settings → Habitica tab).
   * Clicks the visible control (native checkbox is CSS-hidden).
   */
  async clickConnectHabiticaToggle() {
    await this.connectHabiticaLabel.click();
  }

  /**
   * Click the SkipToBreak (>>) button.
   * Call only after confirming showSkipToBreak is enabled and the timer is running.
   */
  async clickSkipToBreak() {
    await this.skipToBreak.click();
  }

  /**
   * Click the PomoFreeze (snowflake) button.
   */
  async clickPomoFreeze() {
    await this.pomoFreeze.click();
  }

  /** Click the PomoStop (X) button to end the current session. */
  async clickPomoStop() {
    await this.pomoStop.click();
  }

  /**
   * Return the site-table row (tbody) for a given hostname.
   * @param {string} hostname  e.g. 'ofex.me' or 'localhost'
   */
  siteRow(hostname) {
    return this.page.locator(`[data-testid="site-row"][data-hostname="${hostname}"]`);
  }

  /**
   * Return the delete (trash) button inside a specific site row.
   * @param {string} hostname
   */
  siteRowDeleteButton(hostname) {
    return this.siteRow(hostname).getByTestId('site-delete');
  }

  /**
   * Return the edit (pencil) control inside a specific site row.
   * @param {string} hostname
   */
  siteRowEditButton(hostname) {
    return this.siteRow(hostname).getByTestId('site-edit');
  }

  /**
   * Click the edit (pencil) control for a site row.
   * @param {string} hostname
   */
  async clickSiteRowEditButton(hostname) {
    await this.siteRowEditButton(hostname).click();
  }

  /**
   * Return the inline pass-duration input that appears when a site row is in
   * edit mode.
   * @param {string} hostname
   */
  siteRowPassDurationInput(hostname) {
    return this.siteRow(hostname).getByTestId('site-pass-duration-input');
  }

  // ---------------------------------------------------------------------------
  // Extended actions
  // ---------------------------------------------------------------------------

  /**
   * Wait for the popup's async initialisation to finish.
   * The body starts with class "loading" which is removed once init is done;
   * main-container becomes visible at the same moment.
   */
  async waitForReady() {
    await this.mainContainer.waitFor({ state: 'visible' });
  }

  /**
   * Reload the popup page and wait for its async initialisation to finish.
   */
  async reloadPopup() {
    await this.page.reload();
    await this.waitForReady();
  }

  /**
   * Open the Settings panel and make sure it is visible before returning.
   * If the panel is already open (e.g. prior step left it open), does not toggle closed.
   */
  async openSettings() {
    if (await this.settingsPanel.isVisible()) {
      return;
    }
    await this.clickSettings();
    await this.settingsPanel.waitFor({ state: 'visible' });
  }

  /**
   * Open the Settings panel and navigate to the Timer sub-tab.
   */
  async openSettingsTimerTab() {
    await this.openSettings();
    await this.switchToTimerTab();
  }

  /**
   * Open the Settings panel and navigate to the Habitica sub-tab.
   */
  async openSettingsHabiticaTab() {
    await this.openSettings();
    await this.switchToHabiticaTab();
  }

  /**
   * Open the Settings panel and navigate to the Blocker sub-tab.
   */
  async openSettingsBlockerTab() {
    await this.openSettings();
    await this.switchToBlockerTab();
  }

  /**
   * Configure pomo, break, and pomo-set-num all in one quick-settings visit.
   * @param {{ pomo?: number, break?: number, longBreak?: number, pomoSetNum?: number }} opts
   */
  async configureQuickSettings(opts = {}) {
    await this.openQuickSettings();
    if (opts.pomo !== undefined)      await this.quickSetPomoDuration.fill(String(opts.pomo));
    if (opts.break !== undefined)     await this.quickSetBreakDuration.fill(String(opts.break));
    if (opts.longBreak !== undefined) await this.quickSetLongBreakDuration.fill(String(opts.longBreak));
    if (opts.pomoSetNum !== undefined) await this.quickSetPomoSetNum.fill(String(opts.pomoSetNum));
    await this.saveQuickSettings();
  }

  /**
   * Wait until the timer display changes from a given value.
   * @param {string} initialValue  e.g. '25:00'
   */
  async waitForTimerToChange(initialValue) {
    await expect(this.timerDisplay).not.toHaveText(initialValue);
  }

  // ---------------------------------------------------------------------------
  // Storage helpers
  // ---------------------------------------------------------------------------

  /**
   * Patch one or more fields inside the USER_DATA object in chrome.storage.sync
   * (the storage area the service worker reads for all user settings).
   * Returns the original USER_DATA snapshot so callers can restore it.
   *
   * @param {Record<string, unknown>} patch  e.g. { showFreeze: true }
   * @returns {Promise<object|null>} the previous USER_DATA value (null if absent)
   */
  async patchUserData(patch) {
    const original = await this.page.evaluate(({ patch }) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('USER_DATA', (result) => {
          const prev = result['USER_DATA'] ?? null;
          const updated = Object.assign({}, prev ?? {}, patch);
          chrome.storage.sync.set({ USER_DATA: updated }, () => resolve(prev));
        });
      });
    }, { patch });
    // Popup init uses get_data (service worker Vars), not storage alone — keep SW in sync.
    await syncServiceWorkerFromStorage(this.page, ['USER_DATA']);
    return original;
  }

  /**
   * Reset the service worker timer state and wait for the button to reflect it.
   * Call this at the start of any test that clicks the pomo button, to guard
   * against dirty state left by previous tests in the same worker context.
   */
  async resetTimerState() {
    await this.page.evaluate(() => new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { sender: 'popup', msg: 'run_function', functionName: 'pomoReset', args: [] },
        resolve,
      );
    }));
    await this.waitForPomoButtonClass('tomatoWait');
  }

  /**
   * Wait until the pomo button has a specific CSS class (uses Playwright expect
   * auto-retry / polling). Defaults to 75 s to accommodate a full 1-min pomodoro
   * plus scheduling overhead; override with `timeout` when a shorter wait suffices.
   * @param {string} cls  e.g. 'tomatoBreak'
   * @param {number} [timeout=75_000]
   */
  async waitForPomoButtonClass(cls, timeout = 75_000) {
    await expect(this.pomoButton).toContainClass(cls, { timeout });
  }
}

module.exports = { PopupPage };
