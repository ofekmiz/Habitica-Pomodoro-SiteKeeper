/**
 * Parse extension timer display (MM:SS) to total seconds for strict assertions.
 * @param {string | null | undefined} text
 * @returns {number}
 */
function parseTimerDisplayToSeconds(text) {
  const s = String(text ?? '').trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) {
    throw new Error(`Timer display not MM:SS: ${JSON.stringify(text)}`);
  }
  const minutes = parseInt(m[1], 10);
  const seconds = parseInt(m[2], 10);
  return minutes * 60 + seconds;
}

module.exports = { parseTimerDisplayToSeconds };
