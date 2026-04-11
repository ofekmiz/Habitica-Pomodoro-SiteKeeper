/**
 * seed.spec.js — Reference template for humans and MCP / AI test generation.
 *
 * NOT executed: Playwright’s testDir is `specs/` only. Do not move this file into
 * `specs/` unless you intend it to run as a real test.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MCP / AI generation guidelines (read first)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. Prefer existing fixtures (`tests/fixtures/index.js`) and `scenarioBuilder`
 *    flows over ad-hoc `chrome.storage` scripts in the spec. Add a new fixture
 *    when the same “given” state will repeat across tests.
 * 2. Do not mutate USER_DATA (or Histogram) directly in a spec unless there is
 *    no fixture yet; then snapshot → mutate → restore (see Storage below).
 * 3. All UI access goes through `PopupPage` (`tests/pages/popupPageModel.js`):
 *    no `page.getByTestId`, `page.locator`, or new selectors inside `.spec.js`.
 * 4. Naming: extended fixtures follow `popupPageWith…` / `popupPageShortTimer…`
 *    patterns; base fixture is `popupPage`. Merge new definitions in
 *    `fixtures/index.js` — never chain ad-hoc `test.extend` in a spec.
 * 5. Import `test` and `expect` from `tests/fixtures` (or `fixtures/index`), never
 *    from `@playwright/test` in spec files. Use `constants/testConstants.js` for
 *    default durations and hosts, not literals in assertions.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture (detail lives in tests/README.md)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  fixtures/base.js        Extension context, popupPage, newPopupPage, …
 *  fixtures/index.js       Merged scenario fixtures (history, site-blocker, short timer).
 *  fixtures/scenarioBuilder.js   createScenario / cleanupScenario, USER_DATA apply + sync.
 *  fixtures/userDataStorage.js   USER_DATA, syncServiceWorkerFromStorage, snapshot/restore.
 *  pages/popupPageModel.js       POM — locators + actions only.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Rules (convention)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  • AAA: Arrange / Act / Assert in every test (comments help).
 *  • No raw selectors in tests — POM only.
 *  • No page.waitForTimeout except where an existing spec uses bounded polling
 *    for timer behaviour.
 *  • Storage: if a test changes USER_DATA, snapshot before and restore after
 *    (beforeEach/afterEach or try/finally), then sync SW + reset pomodoro as in
 *    tests/README.md. Use chrome.storage.sync + USER_DATA — not local.
 */

const { test, expect } = require('./fixtures');
const { snapshotUserData, restoreUserData, resetServiceWorkerPomodoro } = require('./fixtures/userDataStorage');

// Example suite: skipped so it never runs; illustrates snapshot/restore for storage mutation.
test.describe.skip('Seed — template only (AAA + POM + storage hooks)', () => {
  let snapshot;

  test.beforeEach(async ({ popupPage }) => {
    snapshot = await snapshotUserData(popupPage.page);
  });

  test.afterEach(async ({ popupPage }) => {
    await restoreUserData(popupPage.page, snapshot).catch(() => {});
    await resetServiceWorkerPomodoro(popupPage.page).catch(() => {});
  });

  // Arrange: fixture opened popup and waited for ready. Act: (none). Assert: initial UI.
  test('main container and timer visible on load', async ({ popupPage }) => {
    await expect(popupPage.mainContainer).toBeVisible();
    await expect(popupPage.timerDisplay).toHaveText('00:00');
    await expect(popupPage.pomoButton).toHaveClass(/tomatoWait/);
  });

  // Act + assert through POM only; afterEach restores storage.
  test('welcome copy when reloading popup', async ({ popupPage }) => {
    await popupPage.reloadPopup();

    await expect(popupPage.welcomeInfo).toBeVisible();
    await expect(popupPage.blockLink).toHaveText(/Block Site!/i);
  });

  // Open panel via POM action; assert via POM getters — no selectors here.
  test('Settings panel opens from menu', async ({ popupPage }) => {
    await expect(popupPage.settingsPanel).toBeHidden();

    await popupPage.clickSettings();

    await expect(popupPage.settingsPanel).toBeVisible();
    await expect(popupPage.saveButton).toBeVisible();
    await expect(popupPage.pomoDurationInput).toBeVisible();
  });
});
