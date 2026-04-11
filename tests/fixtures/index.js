/**
 * fixtures/index.js — single import point for all extended fixtures.
 *
 * Lifecycle diagram: see ../README.md (Runtime flow).
 *
 * Tests that need scenario-specific fixtures import from here:
 *   const { test, expect } = require('../../fixtures/index');
 *
 * The base extension-loading fixtures live in fixtures/base.js.
 * Shared scenario setup/teardown for USER_DATA + optional tabs lives in
 * fixtures/scenarioBuilder.js (used by site-blocker and short-timer fixtures).
 *
 * Each fixture module exports its raw `definitions` object so they can all
 * be merged into one `test` via a single base.extend() call — the safest
 * Playwright pattern (no internal API access, no chaining surprises).
 *
 * Available fixtures
 * ──────────────────
 *  From fixtures/base.js (base):
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
 */

const { test: base, expect } = require('./base');
const { definitions: historyDefs } = require('./historyFixture');
const { definitions: siteBlockerDefs } = require('./siteBlockerFixture');
const { definitions: shortTimerDefs } = require('./shortTimerFixture');

const allDefs = { ...historyDefs, ...siteBlockerDefs, ...shortTimerDefs };

const allKeys = [
  ...Object.keys(historyDefs),
  ...Object.keys(siteBlockerDefs),
  ...Object.keys(shortTimerDefs),
];
const dupes = allKeys.filter((k, i) => allKeys.indexOf(k) !== i);
if (dupes.length) {
  throw new Error(`Duplicate fixture definitions: ${dupes.join(', ')}`);
}

exports.test = base.extend(allDefs);

exports.expect = expect;
