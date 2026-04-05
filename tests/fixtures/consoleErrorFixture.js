/**
 * Opt-in fixtures: attach console + pageerror listeners, assert no errors after the test.
 * List `noConsoleErrors` and/or `noConsoleErrorsWithOfexBlocked` in the test args.
 */

const { test: base, expect } = require('../fixtures');

function attachConsoleAssertions(page) {
  const errors = [];
  const onConsole = (msg) => {
    if (msg.type() === 'error') {
      errors.push(`console.${msg.type()}: ${msg.text()}`);
    }
  };
  const onPageError = (err) => {
    errors.push(`pageerror: ${err.message}`);
  };
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  return () => {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    expect(errors, errors.join('\n')).toEqual([]);
  };
}

const definitions = {
  noConsoleErrors: async ({ popupPage }, use) => {
    const assertClean = attachConsoleAssertions(popupPage.page);
    await use();
    assertClean();
  },

  noConsoleErrorsWithOfexBlocked: async ({ popupPageWithOfexBlocked }, use) => {
    const assertClean = attachConsoleAssertions(popupPageWithOfexBlocked.popupPage.page);
    await use();
    assertClean();
  },
};

exports.definitions = definitions;
exports.test = base.extend(definitions);
exports.expect = expect;
