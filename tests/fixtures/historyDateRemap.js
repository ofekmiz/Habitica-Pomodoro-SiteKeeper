/**
 * Remap histogram fixture keys to a rolling local-date window so chart "current week"
 * and related UI stay anchored to the machine date when tests run.
 *
 * Window rule (N consecutive local calendar days ending on today):
 *   Indices 0 … N-1 map oldest → newest (newest is "today").
 *
 * Data: take the last N chronological keys from the raw fixture (default N=21 so chart prev/next
 * can move between windows). Reassign those entries to N consecutive local dates ending on "today",
 * preserving minutes/pomodoros order.
 * Recompute weekday on each entry to match the new date (full English name, same shape as JSON).
 *
 * Pass `windowYmds` from the extension page (see getBrowserRollingWindowYmds) so keys match
 * utility.js getDate() in the browser (timezone-safe).
 */

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} [n=21]
 * @returns {Promise<string[]>} YYYY-MM-DD oldest first, using browser local calendar dates
 */
async function getBrowserRollingWindowYmds(page, n = 21) {
  return page.evaluate((count) => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      d.setDate(d.getDate() - (count - 1 - i));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      result.push(`${y}-${m}-${day}`);
    }
    return result;
  }, n);
}

/**
 * @param {Record<string, { minutes?: number, pomodoros?: number, weekday?: string }>} rawHistogram
 * @param {string[]} windowYmds  YYYY-MM-DD strings (same length as slice from fixture, e.g. 21 for chart prev/next)
 * @returns {Record<string, { minutes: number, pomodoros: number, weekday: string }>}
 */
function remapHistogramToRollingWindow(rawHistogram, windowYmds) {
  const sortedKeys = Object.keys(rawHistogram).sort();
  if (sortedKeys.length === 0) {
    return {};
  }

  const sliceKeys = sortedKeys.slice(-windowYmds.length);
  const n = sliceKeys.length;
  if (windowYmds.length !== n) {
    throw new Error(`windowYmds length ${windowYmds.length} !== fixture slice length ${n}`);
  }

  const out = {};
  for (let i = 0; i < sliceKeys.length; i++) {
    const src = rawHistogram[sliceKeys[i]];
    const newKey = windowYmds[i];
    const { minutes = 0, pomodoros = 0 } = src;
    out[newKey] = {
      minutes,
      pomodoros,
      weekday: weekdayEnglishForLocalYmd(newKey),
    };
  }
  return out;
}

function weekdayEnglishForLocalYmd(ymd) {
  const [y, mo, day] = ymd.split('-').map((x) => parseInt(x, 10));
  const d = new Date(y, mo - 1, day);
  return WEEKDAYS_EN[d.getDay()];
}

module.exports = {
  remapHistogramToRollingWindow,
  getBrowserRollingWindowYmds,
};
