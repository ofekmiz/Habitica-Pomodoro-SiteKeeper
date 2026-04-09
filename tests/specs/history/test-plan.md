# Suite 10 — History Panel (with fixture data)

**Spec file:** `tests/specs/history/history.spec.js`

**Fixture:** `popupPageWithHistory` — pre-loads `tests/fixtures/HistoryTestData.json` into extension storage before each test. `loadRemappedHistogramForPage` remaps fixture dates to the current date range so chart navigation assertions are meaningful.

---

## 10.1 pre-load fixture → open History panel → stats show non-zero values

**Steps:**
1. Open the popup (fixture pre-loaded), click `[data-testid='menu-history-trigger']`
   - expect: `[data-testid='history-panel']` is visible
   - expect: `[data-testid='pomo-total']` text content parses to an integer > 0
   - expect: `[data-testid='hours-total']` text content parses to a float > 0
   - expect: `[data-testid='pomo-avg']` text content parses to a float > 0
   - expect: `[data-testid='hours-avg']` text content parses to a float > 0

---

## 10.2 chart renders: canvas visible, summary label shows 'Sum: X | Avg: Y'

**Steps:**
1. Open History panel (fixture pre-loaded)
   - expect: `[data-testid='history-chart']` canvas element is visible
   - expect: `[data-testid='history-chart-total']` text content contains `'Sum:'` (case-insensitive)
   - expect: `[data-testid='history-chart-total']` text content contains `'Avg:'` (case-insensitive)

---

## 10.3 toggle chart view: Pomodoros → Hours → Pomodoros

**Steps:**
1. Open History panel, note the initial `[data-testid='history-chart-total']` text (Pomodoros view)
2. Click `[data-testid='history-chart-show-hours']`
   - expect: `[data-testid='history-chart-total']` text changes (Hours view differs from Pomodoros view)
3. Click `[data-testid='history-chart-show-pomodoros']`
   - expect: `[data-testid='history-chart-total']` text reverts to the initial value

---

## 10.4 navigate prev/next: click prev arrow → chart shifts to earlier 7-day window; click next → returns

**Steps:**
1. Open History panel, note the current `[data-testid='history-chart-total']` value
2. Click `[data-testid='history-chart-prev']`
   - expect: `[data-testid='history-chart-total']` text changes (earlier window)
3. Click `[data-testid='history-chart-next']`
   - expect: `[data-testid='history-chart-total']` text reverts to the original value

---

## 10.5 Full History & Backup link visible and opens fullHistory.html in new tab

**Steps:**
1. Open History panel, locate `[data-testid='backup-link']` (full history / backup link)
   - expect: `[data-testid='backup-link']` is visible
2. Click `[data-testid='backup-link']`
   - expect: A new tab opens with URL matching `fullHistory.html`

**Cleanup:** Close the new tab.

---

## 10.6 backup data warning visible in history panel

**Steps:**
1. Open History panel by clicking `[data-testid='menu-history-trigger']`
   - expect: `[data-testid='backup-data-warning']` is visible

---

## 10.7 Download History: click download button → file download triggered with filename matching /histogram|history/i

**Steps:**
1. Open History panel (fixture pre-loaded), set up a download listener, click `[data-testid='download-histogram']`
   - expect: A file download event is triggered
   - expect: The suggested filename matches `/histogram|history/i`

---

## 10.8 Import history: select fixture JSON, click import → stats non-zero; click clear → all stats reset to 0

**Steps:**
1. Open History panel, use `[data-testid='import-histogram-file']` to attach the remapped fixture JSON (`Histogram.json`), click `[data-testid='import-histogram']`
   - expect: Wait for ready state, reopen History panel
   - expect: `[data-testid='pomo-total']` parses to an integer > 0
2. Click `[data-testid='clear-histogram']`
   - expect: Reopen History panel
   - expect: `[data-testid='pomo-today']` shows `'0'`
   - expect: `[data-testid='hours-today']` shows `'0'`
   - expect: `[data-testid='pomo-total']` shows `'0'`
   - expect: `[data-testid='hours-total']` shows `'0.0'`
   - expect: `[data-testid='pomo-avg']` shows `'0.0'`
   - expect: `[data-testid='hours-avg']` shows `'0.0'`

> **Note:** After import and after clear, the History panel must be reopened (`openHistoryPanel()`) for the UI to reflect the new storage values. This is a known workaround for a UI refresh bug.
