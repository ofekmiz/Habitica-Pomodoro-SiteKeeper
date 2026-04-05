/**
 * seed.spec.ts — Best-practice reference test
 *
 * This file is the canonical example of how tests in this project are
 * structured. Read it before writing new specs.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Architecture at a glance
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  fixtures/index.js          Extended Playwright fixtures.
 *  │  ├─ popupPage            Fresh popup page, extension loaded, loading done.
 *  │  ├─ popupPageWithHistory Popup with HistoryTestData.json pre-loaded.
 *  │  ├─ popupPageShortTimer  Popup with 1-min pomo/break for fast timer tests.
 *  │  └─ …
 *  │
 *  pages/popupPageModel.js    Page Object Model (POM).
 *     ├─ Getters              Return Playwright Locators (no selectors in tests).
 *     └─ Actions              Encapsulate multi-step UI interactions.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Rules (enforced by convention, not lint)
 * ──────────────────────────────────────────────────────────────────────────
 *  1. Import `test` and `expect` from the nearest fixtures file, NEVER from
 *     @playwright/test directly (except inside the POM or fixtures themselves).
 *  2. All locators live in popupPageModel.js — tests never call
 *     page.getByTestId() or page.locator() directly.
 *  3. AAA pattern: every test has a clear Arrange / Act / Assert structure.
 *  4. No hard waits (page.waitForTimeout) except in timer tests where a
 *     counted delay is the only way to verify timer behaviour.
 *  5. Storage state set-up and tear-down is done via chrome.storage.local
 *     inside page.evaluate(), never via the UI, to keep tests fast and
 *     deterministic.
 */

// ─── Import from the extended fixtures, not @playwright/test directly ───────
const { test, expect } = require('./fixtures');

// ─── Suite wraps a logical group of related tests ───────────────────────────
test.describe.skip('Seed — Popup Initial Load', () => {
  /**
   * 1. Arrange  — the fixture already opened the popup and waited for it to
   *               finish loading; no extra setup needed here.
   * 2. Act      — (nothing; this test only inspects the initial DOM state)
   * 3. Assert   — verify the main container and timer display are correct.
   *
   * Notice:
   *  • We access `popupPage.mainContainer` (a getter on PopupPage) — no raw
   *    selectors in the test body.
   *  • We use Playwright's `expect` matchers — no manual boolean checks.
   */
  test('main container is visible on initial load', async ({ popupPage }) => {
    // Assert
    await expect(popupPage.mainContainer).toBeVisible();
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
  });

  /**
   * Example of an Arrange / Act / Assert test that mutates state.
   *
   * Storage state is injected via chrome.storage.local (fast, no network
   * calls) and cleaned up after the test to keep isolation.
   */
  test('shows welcome info when no sites are blocked', async ({ popupPage }) => {
    // Arrange — ensure no blocked sites (clean state from fixture)
    await popupPage.page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.remove('BlockedSites', resolve);
      });
    });
    await popupPage.reloadPopup();

    // Act — (nothing; just observing the UI)

    // Assert
    await expect(popupPage.welcomeInfo).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
  });

  /**
   * Example: opening a panel via POM action, then asserting via POM getters.
   * Notice there are no selectors in the test — all interactions go through
   * the POM methods and locator getters.
   */
  test('Settings panel opens and reveals save button', async ({ popupPage }) => {
    // Arrange — panel is hidden by default
    await expect(popupPage.settingsPanel).toBeHidden();

    // Act
    await popupPage.clickSettings();

    // Assert
    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.saveButton).toBeVisible();
    await expect(popupPage.pomoDurationInput).toBeVisible();
  });
});
