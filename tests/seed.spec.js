/**
 * seed.spec.js — Best-practice reference for Playwright MCP test generation.
 *
 * This file is NOT executed by the test runner (it lives outside `specs/`).
 * It serves as a template for the Playwright MCP tools when generating new
 * test files. Read it before writing new specs.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Architecture at a glance
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  fixtures/base.js           Base extension-loading fixtures.
 *  fixtures/index.js          Merges base + scenario fixtures into one `test`.
 *  │  ├─ popupPage            Fresh popup page, extension loaded, loading done.
 *  │  ├─ popupPageWithHistory Popup with HistoryTestData.json pre-loaded.
 *  │  ├─ popupPageShortTimer  Popup with 1-min pomo/break for fast timer tests.
 *  │  ├─ popupPageWithOfexBlocked      { popupPage, activePage } — ofex.me pre-blocked
 *  │  ├─ popupPageWithLocalhostBlocked { popupPage, activePage } — localhost pre-blocked
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
 *     - Use `../../fixtures` for tests that only need the base popupPage.
 *     - Use `../../fixtures/index` for tests that need extended fixtures.
 *  2. All locators live in popupPageModel.js — tests never call
 *     page.getByTestId() or page.locator() directly.
 *  3. AAA pattern: every test has a clear Arrange / Act / Assert structure.
 *  4. No hard waits (page.waitForTimeout) except where a bounded poll is the
 *     only way to verify timer behaviour without flaking.
 *  5. Storage setup/teardown for "given state" uses chrome.storage.sync and
 *     USER_DATA / Histogram (see fixtures/userDataStorage.js), then syncs the
 *     service worker — not chrome.storage.local.
 *  6. Every describe that mutates state must have:
 *     - test.beforeEach: snapshot USER_DATA via snapshotUserData()
 *     - test.afterEach: restore USER_DATA via restoreUserData() + reset timer
 *       via resetServiceWorkerPomodoro(). Both wrapped in .catch(() => {}).
 *     - No manual cleanup at the end of individual tests.
 *  7. Default values (pomo duration, break, etc.) come from
 *     constants/testConstants.js — never hardcode '25', '5', etc. in assertions.
 *  8. For mixed-fixture specs, use nested describes to separate tests that use
 *     different fixtures (each with their own beforeEach/afterEach).
 */

// ─── Import from the extended fixtures, not @playwright/test directly ───────
const { test, expect } = require('./fixtures');
const { snapshotUserData, restoreUserData, resetServiceWorkerPomodoro } = require('./fixtures/userDataStorage');

// ─── Suite wraps a logical group of related tests ───────────────────────────
test.describe.skip('Seed — Popup Initial Load', () => {
  let snapshot;

  test.beforeEach(async ({ popupPage }) => {
    snapshot = await snapshotUserData(popupPage.page);
  });

  test.afterEach(async ({ popupPage }) => {
    await restoreUserData(popupPage.page, snapshot).catch(() => {});
    await resetServiceWorkerPomodoro(popupPage.page).catch(() => {});
  });

  /**
   * 1. Arrange  — the fixture already opened the popup and waited for it to
   *               finish loading; no extra setup needed here.
   * 2. Act      — (nothing; this test only inspects the initial DOM state)
   * 3. Assert   — verify the main container and timer display are correct.
   */
  test('main container is visible on initial load', async ({ popupPage }) => {
    await expect(popupPage.mainContainer).toBeVisible();
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
  });

  /**
   * Example of an Arrange / Act / Assert test that mutates state.
   * afterEach handles cleanup — no manual restoration needed.
   */
  test('shows welcome info when no sites are blocked', async ({ popupPage }) => {
    await popupPage.reloadPopup();

    await expect(popupPage.welcomeInfo).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
  });

  /**
   * Example: opening a panel via POM action, then asserting via POM getters.
   */
  test('Settings panel opens and reveals save button', async ({ popupPage }) => {
    await expect(popupPage.settingsPanel).toBeHidden();

    await popupPage.clickSettings();

    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.saveButton).toBeVisible();
    await expect(popupPage.pomoDurationInput).toBeVisible();
  });
});
