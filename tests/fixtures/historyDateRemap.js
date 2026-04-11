/**
 * Remap histogram fixture keys to a rolling local-date window so chart "current week"
 * and related UI stay anchored to the machine date when tests run.
 *
 * Window rule (N consecutive local calendar days ending on today):
 *   Indices 0 … N-1 map oldest → newest (newest is "today").
 *
 * Data: take the last min(fixture keys, window length) chronological keys (default window 21).
 * Reassign those entries to the same number of consecutive local dates ending on "today",
 * preserving minutes/pomodoros order. If the fixture has fewer days than the window, only the
 * trailing window days are used; if the window is shorter than the fixture, only the newest slice
 * of fixture keys is kept.
 * Recompute weekday on each entry to match the new date (full English name, same shape as JSON).
 *
 * Pass `windowYmds` from the extension page (see getBrowserRollingWindowYmds) so keys match
 * utility.js getDate() in the browser. Weekdays for remapped keys are derived in Node from the same
 * Y-M-D components (civil calendar), matching the browser-produced strings.
 */

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} [n=21]
 * @returns {Promise<string[]>} YYYY-MM-DD oldest first, using browser local calendar dates
 */
async function getBrowserRollingWindowYmds(page, n = 21) {
  return page.evaluate((count) => {
    // Coerce so NaN/undefined cannot produce Array length bugs or flaky loops.
    const len = Math.max(0, Math.floor(Number(count))) || 0;
    const result = new Array(len);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() - (len - 1));
    for (let i = 0; i < len; i++) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      result[i] = `${y}-${m}-${day}`;
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, n);
}

/**
 * @param {Record<string, { minutes?: number, pomodoros?: number, weekday?: string }>} rawHistogram
 * @param {string[]} windowYmds  YYYY-MM-DD oldest→newest from the browser; length may exceed or fall
 *   short of fixture keys — see module docstring for pairing rules.
 * @returns {Record<string, { minutes: number, pomodoros: number, weekday: string }>}
 */
function remapHistogramToRollingWindow(rawHistogram, windowYmds) {
  const keys = Object.keys(rawHistogram);
  if (keys.length === 0 || windowYmds.length === 0) {
    return {};
  }

  // Default string sort matches chronological order for zero-padded YYYY-MM-DD keys.
  keys.sort();
  // Align counts: use the last `take` chronological entries and the last `take` browser window days
  // (ending on "today"). Avoids slice(-0) === slice(0), which would remap the entire fixture when
  // windowYmds is empty (guarded above).
  const take = Math.min(keys.length, windowYmds.length);
  const keyStart = keys.length - take;
  const winStart = windowYmds.length - take;

  const out = {};
  for (let i = 0; i < take; i++) {
    // Index into sorted keys / window instead of slice(-take) (avoids two alloc'd arrays).
    const src = rawHistogram[keys[keyStart + i]] ?? {};
    const newKey = windowYmds[winStart + i];
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
  const parts = ymd.split('-');
  if (parts.length !== 3) {
    console.warn('[historyDateRemap] weekday fallback: expected YYYY-MM-DD, got:', ymd);
    return WEEKDAYS_EN[0];
  }
  const y = parseInt(parts[0], 10);
  const mo = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(day)) {
    console.warn('[historyDateRemap] weekday fallback: non-numeric Y-M-D segments:', ymd);
    return WEEKDAYS_EN[0];
  }
  const d = new Date(y, mo - 1, day);
  if (Number.isNaN(d.getTime())) {
    console.warn('[historyDateRemap] weekday fallback: invalid calendar date:', ymd);
    return WEEKDAYS_EN[0];
  }
  return WEEKDAYS_EN[d.getDay()];
}

module.exports = {
  remapHistogramToRollingWindow,
  getBrowserRollingWindowYmds,
};
