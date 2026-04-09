/**
 * Shared URLs and hostnames for extension E2E tests (specs + fixtures).
 */

exports.HOST_OFEX = 'ofex.me';
exports.HOST_LOCALHOST = 'localhost';

/** Demo page used so the active tab hostname is ofex.me */
exports.OFEX_DEMO_URL = 'https://ofex.me/animation-timer/';

/** Used for localhost blocker scenarios (connection may fail; tests ignore load errors) */
exports.LOCALHOST_URL = 'http://localhost/';

/** Example whitelist line used in settings-blocker tests (matches built-in demo URL host + path). */
exports.OFEX_WHITELIST_SAMPLE = `${exports.HOST_OFEX}/animation-timer`;

/** Extension default values (used in assertions to avoid hardcoded strings). */
exports.DEFAULT_POMO_DURATION = '25';
exports.DEFAULT_BREAK_DURATION = '5';
exports.DEFAULT_LONG_BREAK_DURATION = '30';
exports.DEFAULT_POMO_SET_NUM = '4';
exports.DEFAULT_BREAK_EXTENSION = '2';
