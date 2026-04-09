# Suite 11 — Edge Cases

**Spec file:** `tests/specs/edge-cases/edge-cases.spec.js`

---

## 11.1 rapid tomato clicks (5×) → no JS errors, timer state consistent

**Steps:**
1. Reset timer state (`resetTimerState()`), then click `[data-testid='pomo-button']` 5 times in rapid succession
   - expect: `[data-testid='pomo-button']` is in a consistent CSS class state (`tomatoWait` or `tomatoProgress`)
   - expect: `[data-testid='timer-display']` shows a valid `MM:SS` format string

---

## 11.2 timer state persists across popup close/reopen: start timer, close popup, reopen → timer still counting at lower value

**Fixture:** `newPopupPage` factory — opens a fresh popup page instance on demand.

**Steps:**
1. Open a new popup page, reset timer state, click `[data-testid='pomo-button']`, wait for `tomatoProgress` class, note the timer value, close the popup page
   - expect: `[data-testid='pomo-button']` has class `tomatoProgress` before closing
2. Open a second new popup page, wait for `tomatoProgress` class
   - expect: `[data-testid='pomo-button']` still has class `tomatoProgress`
   - expect: Timer value changes from the pre-close value (timer continued running in the background — poll up to 15 s)
   - expect: Timer display matches `MM:SS` format

**Cleanup:** Click `[data-testid='pomo-button']` on the second popup to stop the timer.

---

## 11.3 invalid pomo duration input ('abc') → save → previous valid value retained, no crash

**Steps:**
1. Open Settings > Timer tab, read the current valid `[data-testid='pomo-duration']` value
2. Fill `[data-testid='pomo-duration']` with `'abc'`, click `[data-testid='save-button']`
3. Reload the popup, reopen Settings > Timer tab
   - expect: `[data-testid='pomo-duration']` retains the previous valid value (e.g. `'25'`)

---

## 11.4 invalid pass duration input ('abc') on blocked site edit row → rejected/defaulted (30 retained), no JS errors

**Fixture:** `popupPageWithOfexBlocked` — `ofex.me` pre-blocked in storage.

**Steps:**
1. Call `patchUserData({ ConnectHabitica: true })` then reload the popup (required to render edit button)
2. Click the edit (pencil) button for the `ofex.me` row, wait for the pass duration input to be visible
3. Fill the input with `'abc'`, press Enter
   - expect: The `ofex.me` row still contains text `'30'` (invalid value rejected; original duration retained)
