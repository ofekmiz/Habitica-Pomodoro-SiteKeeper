# Suite 4 — Quick Settings

**Spec file:** `tests/specs/quick-settings/quick-settings.spec.js`

---

## 4.1 open quick-settings overlay: gear icon click → overlay appears, fields pre-filled, pomodoro section hides

**Steps:**
1. Click `[data-testid='quick-settings']` (gear icon)
   - expect: `[data-testid='quick-settings-panel']` becomes visible
   - expect: `[data-testid='quick-set-pomo-duration']` is visible and has value `'25'`
   - expect: `[data-testid='quick-set-break-duration']` has value `'5'`
   - expect: `[data-testid='quick-set-long-break-duration']` has value `'30'`
   - expect: `[data-testid='quick-set-pomo-set-num']` has value `'4'`
   - expect: `[data-testid='pomodoro-section']` main timer area is hidden while overlay is open

---

## 4.2 save quick settings: change pomo duration to 30, click OK, panel closes, duration persisted

**Steps:**
1. Click `[data-testid='quick-settings']`, fill `[data-testid='quick-set-pomo-duration']` with `'30'`
   - expect: `[data-testid='quick-set-pomo-duration']` has value `'30'`
2. Click `[data-testid='quick-save']`
   - expect: `[data-testid='quick-settings-panel']` is hidden
   - expect: `[data-testid='pomodoro-section']` is visible again
3. Click `[data-testid='quick-settings']` to reopen
   - expect: `[data-testid='quick-set-pomo-duration']` has value `'30'` (persisted)

**Cleanup:** Reopen quick settings, restore duration to `'25'`, save.

---

## 4.3 take manual break: set duration to 5, click take-break arrow → break starts, set counter shows --/--

**Steps:**
1. Click `[data-testid='quick-settings']`, fill `[data-testid='quick-set-take-break-duration']` with `'5'`
   - expect: `[data-testid='quick-set-take-break-duration']` has value `'5'`
2. Click `[data-testid='quick-set-take-break']`
   - expect: `[data-testid='quick-settings-panel']` is hidden
   - expect: `[data-testid='pomo-button']` has CSS class `tomatoBreak` (break state active)
   - expect: `[data-testid='timer-display']` has attribute `data-pomodoros-set` equal to `'--/--'`

**Cleanup:** Click `[data-testid='pomo-button']` to end the break.
