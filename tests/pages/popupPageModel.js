/**
 * Page Object Model for the extension popup.
 *
 * All locators are exposed as getters so they are lazily evaluated and always
 * reference the live page. Action methods encapsulate multi-step interactions
 * that would otherwise be repeated across tests.
 *
 * Every locator uses getByTestId() so selectors are decoupled from CSS classes,
 * element IDs, and markup structure — the Playwright-recommended best practice.
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
    return this.page.getByTestId('quick-settings');
  }

  /** X button that ends the current session (visible during break / break-extension). */
  get pomoStop() {
    return this.page.getByTestId('pomo-stop');
  }

  /** >> button that skips the running pomodoro straight to break (requires showSkipToBreak setting). */
  get skipToBreak() {
    return this.page.getByTestId('skip-to-break');
  }

  /** Snowflake button that freezes / pauses the pomodoro (requires showFreeze setting). */
  get pomoFreeze() {
    return this.page.getByTestId('pomo-freeze');
  }

  /** Button that opens the popup in a standalone window. */
  get popupNewWindow() {
    return this.page.getByTestId('popup-new-window');
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
    return this.page.getByTestId('quick-save');
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

  get showFreezeCheckbox() {
    return this.page.getByTestId('show-freeze');
  }

  get manualBreakCheckbox() {
    return this.page.getByTestId('manual-break');
  }

  get resetPomoAfterBreakCheckbox() {
    return this.page.getByTestId('reset-pomo-after-break');
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
    return this.page.getByTestId('save-button');
  }

  // ---------------------------------------------------------------------------
  // Settings – Habitica sub-tab inputs
  // ---------------------------------------------------------------------------

  get connectHabiticaToggle() {
    return this.page.getByTestId('connect-habitica');
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
    return this.page.getByTestId('history-chart-show-pomodoros');
  }

  get historyChartShowHours() {
    return this.page.getByTestId('history-chart-show-hours');
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
    return this.page.getByTestId('backup-link');
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
    return this.page.getByTestId('import-histogram');
  }

  get clearHistogram() {
    return this.page.getByTestId('clear-histogram');
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
    return this.page.getByTestId('rate-and-review-link');
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

  /**
   * Switch to the Timer inner-tab inside the Settings panel.
   * Same visibility caveat as switchToHabiticaTab().
   */
  async switchToTimerTab() {
    await this.innerMenuTimer.evaluate((el) => el.click());
  }

  /**
   * Toggle the Connect Habitica switch (Settings → Habitica tab).
   * Uses evaluate() because the native checkbox is CSS-hidden by the switch UI;
   * Playwright's normal click() requires the element to be visible.
   */
  async clickConnectHabiticaToggle() {
    await this.connectHabiticaToggle.evaluate((el) => el.click());
  }

  /**
   * Click the SkipToBreak (>>) button.
   * Uses evaluate() because the button may be CSS-hidden; call only after
   * confirming showSkipToBreak is enabled and the timer is running.
   */
  async clickSkipToBreak() {
    await this.skipToBreak.evaluate((el) => el.click());
  }

  /**
   * Click the PomoFreeze (snowflake) button.
   * Uses evaluate() for the same reason as clickSkipToBreak().
   */
  async clickPomoFreeze() {
    await this.pomoFreeze.evaluate((el) => el.click());
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
   * Return the edit (pencil) button inside a specific site row.
   * @param {string} hostname
   */
  siteRowEditButton(hostname) {
    return this.siteRow(hostname).getByTestId('site-edit');
  }

  /**
   * Click the edit (pencil) button for a site row using evaluate(), because
   * the element may be CSS-hidden (e.g. when ConnectHabitica is off) and
   * Playwright's normal click() requires the element to be visible.
   * @param {string} hostname
   */
  async clickSiteRowEditButton(hostname) {
    await this.siteRowEditButton(hostname).evaluate((el) => el.click());
  }

  /**
   * Return the inline pass-duration input that appears when a site row is in
   * edit mode.
   * @param {string} hostname
   */
  siteRowPassDurationInput(hostname) {
    return this.siteRow(hostname).getByTestId('site-pass-duration-input');
  }

  /**
   * Return the pass-duration display text element inside a site row.
   * @param {string} hostname
   */
  siteRowPassDurationText(hostname) {
    return this.siteRow(hostname).getByTestId('site-hostname');
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
   */
  async openSettings() {
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
   * Open the quick-settings overlay and set pomo duration, then save.
   * @param {number} minutes
   */
  async setQuickPomoDuration(minutes) {
    await this.openQuickSettings();
    await this.quickSetPomoDuration.fill(String(minutes));
    await this.saveQuickSettings();
  }

  /**
   * Open the quick-settings overlay and set break duration, then save.
   * @param {number} minutes
   */
  async setQuickBreakDuration(minutes) {
    await this.openQuickSettings();
    await this.quickSetBreakDuration.fill(String(minutes));
    await this.saveQuickSettings();
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
   * @param {number} [timeout=5000]
   */
  async waitForTimerToChange(initialValue, timeout = 5000) {
    await this.page.waitForFunction(
      (val) => {
        const el = document.querySelector('[data-testid="timer-display"]');
        return el && el.textContent.trim() !== val;
      },
      initialValue,
      { timeout },
    );
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
    return this.page.evaluate(({ patch }) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('USER_DATA', (result) => {
          const original = result['USER_DATA'] ?? null;
          const updated = Object.assign({}, original ?? {}, patch);
          chrome.storage.sync.set({ USER_DATA: updated }, () => resolve(original));
        });
      });
    }, { patch });
  }

  /**
   * Restore USER_DATA in chrome.storage.sync to a previously saved snapshot.
   * Pass the value returned by patchUserData().
   *
   * @param {object|null} original  the value returned by patchUserData()
   */
  async restoreUserData(original) {
    await this.page.evaluate((original) => {
      return new Promise((resolve) => {
        // 1. Fetch current Vars from the service worker
        chrome.runtime.sendMessage({ sender: 'popup', msg: 'get_data' }, (swResponse) => {
          const currentVars = swResponse.vars;
          const restoredUserData = original ?? {};

          // 2. Write to storage
          const storageOp = original === null
            ? (cb) => chrome.storage.sync.remove('USER_DATA', cb)
            : (cb) => chrome.storage.sync.set({ USER_DATA: restoredUserData }, cb);

          storageOp(() => {
            // 3. Push restored UserData back into the service worker
            const updatedVars = Object.assign({}, currentVars, { UserData: restoredUserData });
            chrome.runtime.sendMessage(
              { sender: 'popup', msg: 'set_data', data: { vars: updatedVars } },
              () => resolve(),
            );
          });
        });
      });
    }, original);
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
   * Wait until the pomo button has a specific CSS class.
   * @param {string} cls  e.g. 'tomatoBreak'
   * @param {number} [timeout=120_000]
   */
  async waitForPomoButtonClass(cls, timeout = 120_000) {
    await this.page.waitForFunction(
      (c) => {
        const el = document.querySelector('[data-testid="pomo-button"]');
        return el && el.classList.contains(c);
      },
      cls,
      { timeout },
    );
  }

  /**
   * Check whether the pomo button currently has a specific CSS class.
   * @param {string} cls
   * @returns {Promise<boolean>}
   */
  async pomoButtonHasClass(cls) {
    return this.pomoButton.evaluate(
      (el, c) => el.classList.contains(c),
      cls,
    );
  }
}

module.exports = { PopupPage };
