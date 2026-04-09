# Suite 5 — Settings: Timer Tab

**Spec file:** `tests/specs/settings-timer/settings-timer.spec.js`

---

## 5.1 all fields visible with correct defaults: pomo=25, break=5, long-break=30, set=4, extension=2; checkboxes and sounds

**Steps:**
1. Click `[data-testid='menu-settings-trigger']` to open Settings panel (Timer tab is active by default)
   - expect: `[data-testid='pomo-duration']` value is `'25'`
   - expect: `[data-testid='break-duration']` value is `'5'`
   - expect: `[data-testid='long-break-duration']` value is `'30'`
   - expect: `[data-testid='pomo-set-num']` value is `'4'`
   - expect: `[data-testid='break-extension']` value is `'2'`
   - expect: `[data-testid='show-skip-to-break']` checkbox is unchecked
   - expect: `[data-testid='show-freeze']` checkbox is unchecked
   - expect: `[data-testid='manual-break']` checkbox is checked
   - expect: `[data-testid='reset-pomo-after-break']` checkbox is unchecked
   - expect: `[data-testid='pomodoro-end-sound']` select is visible
   - expect: `[data-testid='break-end-sound']` select is visible
   - expect: `[data-testid='ambient-sound']` select is visible

---

## 5.2 save pomo duration: change to 35, save, reload popup, verify 35

**Steps:**
1. Open Settings > Timer tab, fill `[data-testid='pomo-duration']` with `'35'`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Reload the popup (navigate again to `popup.html`)
3. Reopen Settings > Timer tab
   - expect: `[data-testid='pomo-duration']` shows `'35'`

**Cleanup:** Restore duration to `'25'` and save.

---

## 5.3 save break duration: change to 10, save, reload popup, verify 10

**Steps:**
1. Open Settings > Timer tab, fill `[data-testid='break-duration']` with `'10'`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Reload the popup
3. Reopen Settings > Timer tab
   - expect: `[data-testid='break-duration']` shows `'10'`

**Cleanup:** Restore to `'5'` and save.

---

## 5.4 enable skip-to-break toggle, save, reload → checkbox remains checked; timer shows >> button when running

**Steps:**
1. Open Settings > Timer tab, check `[data-testid='show-skip-to-break']`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Reload the popup
3. Reopen Settings > Timer tab
   - expect: `[data-testid='show-skip-to-break']` is checked
4. Close Settings panel, click `[data-testid='pomo-button']` to start the timer
   - expect: `[data-testid='skip-to-break']` button is visible during the running pomodoro

**Cleanup:** Stop the timer (click pomo-button), reopen Settings > Timer tab, uncheck `show-skip-to-break`, save.

---

## 5.5 enable freeze toggle, save, reload → checkbox remains checked; timer shows snowflake button when running

**Steps:**
1. Open Settings > Timer tab, check `[data-testid='show-freeze']`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Reload the popup
3. Reopen Settings > Timer tab
   - expect: `[data-testid='show-freeze']` is checked
4. Close Settings panel, click `[data-testid='pomo-button']` to start the timer
   - expect: `[data-testid='pomo-freeze']` button (snowflake) is visible during the running pomodoro

**Cleanup:** Stop the timer (click pomo-button), reopen Settings > Timer tab, uncheck `show-freeze`, save.

---

## 5.6 select pomodoro end sound (Sound1.mp3) and ambient sound (Ambient Rain.mp3), verify selections persist

**Steps:**
1. Open Settings > Timer tab, select option with value `'Sound1.mp3'` from `[data-testid='pomodoro-end-sound']`, select option with value `'Ambient Rain.mp3'` from `[data-testid='ambient-sound']`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Reload the popup, reopen Settings > Timer tab
   - expect: `[data-testid='pomodoro-end-sound']` selected value is `'Sound1.mp3'`
   - expect: `[data-testid='ambient-sound']` selected value is `'Ambient Rain.mp3'`
