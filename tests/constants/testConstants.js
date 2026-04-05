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
