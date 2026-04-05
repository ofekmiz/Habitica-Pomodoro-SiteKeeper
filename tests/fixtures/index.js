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
 *    popupPageWithHistory   Popup with HistoryTestData.json pre-loaded into storage
 *
 *  From siteBlockerFixture.js:
 *    popupPageWithOfexBlocked      { popupPage, activePage } — ofex.me pre-blocked
 *    popupPageWithLocalhostBlocked { popupPage, activePage } — localhost pre-blocked
 *
 *  From shortTimerFixture.js:
 *    popupPageShortTimer    Popup with 1-min pomo/break durations for fast timer tests
 */

const { test: base, expect } = require('../fixtures');
const { definitions: historyDefs }      = require('./historyFixture');
const { definitions: siteBlockerDefs }  = require('./siteBlockerFixture');
const { definitions: shortTimerDefs }   = require('./shortTimerFixture');

exports.test = base.extend({
  ...historyDefs,
  ...siteBlockerDefs,
  ...shortTimerDefs,
});

exports.expect = expect;
