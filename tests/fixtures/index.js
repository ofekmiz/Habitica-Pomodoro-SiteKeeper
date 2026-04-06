/**
 * fixtures/index.js — single import point for all extended fixtures.
 *
 * Tests that need scenario-specific fixtures import from here:
 *   const { test, expect } = require('../../fixtures/index');
 *
 * The base extension-loading fixtures live in tests/fixtures.js.
 * Each fixture module exports its raw `definitions` object so they can all
 * be merged into one `test` via a single base.extend() call — the safest
 * Playwright pattern (no internal API access, no chaining surprises).
 *
 * Available fixtures
 * ──────────────────
 *  From tests/fixtures.js (base):
 *    extensionContext       Worker-scoped Chromium context with the extension loaded
 *    extensionId            Dynamically resolved extension ID
 *    popupUrl               Full chrome-extension:// URL to popup.html
 *    popupPage              Fresh PopupPage instance, auto-closed after each test
 *    newPopupPage           Factory: call await newPopupPage() to open extra popup pages
 *                           without importing PopupPage; all pages auto-closed after test
 *
 *  From historyFixture.js:
 *    popupPageWithHistory   Popup with HistoryTestData.json pre-loaded (rolling ~21-day window, browser dates)
 *
 *  From siteBlockerFixture.js:
 *    popupPageWithOfexBlocked      { popupPage, activePage } — ofex.me pre-blocked
 *    popupPageWithLocalhostBlocked { popupPage, activePage } — localhost pre-blocked
 *
 *  From shortTimerFixture.js:
 *    popupPageShortTimer    Popup with 1-min pomo/break, ManualBreak off, for fast timer tests
 *    popupPageShortTimerWithOfexBlocked  { popupPage, activePage } — short timer + ofex blocked
 *    popupPageShortTimerWithLocalhostBlocked  { popupPage, activePage } — short timer + localhost blocked
 *
 *  From consoleErrorFixture.js (opt-in — list in test args):
 *    noConsoleErrors                  Assert no console errors on popupPage.page
 *    noConsoleErrorsWithOfexBlocked   Same for popupPageWithOfexBlocked.popupPage.page
 */

const { test: base, expect } = require('../fixtures');
const { definitions: historyDefs } = require('./historyFixture');
const { definitions: siteBlockerDefs } = require('./siteBlockerFixture');
const { definitions: shortTimerDefs } = require('./shortTimerFixture');
const { definitions: consoleErrorDefs } = require('./consoleErrorFixture');

exports.test = base.extend({
  ...historyDefs,
  ...siteBlockerDefs,
  ...shortTimerDefs,
  ...consoleErrorDefs,
});

exports.expect = expect;
