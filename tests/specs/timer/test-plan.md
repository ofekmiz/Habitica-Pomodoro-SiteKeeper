# Suite 3 — Pomodoro Timer: Core Functionality

**Spec files:**
- `tests/specs/timer/timer.spec.js` — tests 3.1–3.4 (standard timer, no short-timer fixture)
- `tests/specs/timer/timer-short.spec.js` — tests 3.5–3.9 (require `popupPageShortTimer` fixture: pomo=1min, break=1min)

**Short-timer fixture:** `tests/fixtures/shortTimerFixture.js` — configures pomo duration = 1 min, break duration = 1 min via quick settings before each test, then starts from idle.

---

## 3.1 idle state: timer shows 00:00, tomatoWait class, quick-settings visible, pomo-stop/skip/freeze hidden

**Steps:**
1. Open popup in fresh idle state (timer not running)
   - expect: `[data-testid='timer-display']` shows `'00:00'`
   - expect: `[data-testid='pomo-button']` has CSS class `tomatoWait`
   - expect: `[data-testid='quick-settings']` is visible
   - expect: `[data-testid='pomo-stop']` is hidden
   - expect: `[data-testid='skip-to-break']` is hidden
   - expect: `[data-testid='pomo-freeze']` is hidden

---

## 3.2 start timer: click pomo-button → tomatoProgress class, timer counts down, quick-settings hides

**Steps:**
1. Note the current timer display text, then click `[data-testid='pomo-button']`
   - expect: `[data-testid='pomo-button']` gains CSS class `tomatoProgress`
   - expect: `[data-testid='quick-settings']` is hidden
2. Wait for the timer value to change from the initial value
   - expect: `[data-testid='timer-display']` shows a value greater than `0` seconds and at most `25:00`
   - expect: Timer display matches `MM:SS` format

**Cleanup:** Click `[data-testid='pomo-button']` to stop.

---

## 3.3 skip-to-break: enable in Settings, start timer, click skip → enters break state

**Steps:**
1. Open Settings > Timer tab, check `[data-testid='show-skip-to-break']`, click `[data-testid='save-button']`
   - expect: Setting saved (Settings panel closes or confirms)
2. Click `[data-testid='pomo-button']` to start the timer
   - expect: `[data-testid='skip-to-break']` button is visible
3. Click `[data-testid='skip-to-break']`
   - expect: `[data-testid='pomo-button']` gains CSS class `tomatoBreak`
   - expect: `[data-testid='pomo-stop']` is visible

**Cleanup:** Click `[data-testid='pomo-stop']`.

---

## 3.4 freeze/pause: enable in Settings, start timer, click freeze → timer stops (tomatoFreeze), click resume → counts again

**Steps:**
1. Open Settings > Timer tab, check `[data-testid='show-freeze']`, click `[data-testid='save-button']`
   - expect: Setting saved
2. Click `[data-testid='pomo-button']` to start the timer
   - expect: `[data-testid='pomo-freeze']` is visible
3. Wait for the timer to change from `00:00`, note the current value, then click `[data-testid='pomo-freeze']`
   - expect: `[data-testid='pomo-button']` gains CSS class `tomatoFreeze`
   - expect: Timer display is frozen — same value after 2 seconds (poll for 2000 ms)
4. Click `[data-testid='pomo-button']` to resume
   - expect: `[data-testid='pomo-button']` regains class `tomatoProgress`
   - expect: Timer resumes counting down (value decreases from the frozen value)

**Cleanup:** Click `[data-testid='pomo-button']` to stop.

---

## 3.5 complete short pomodoro → break state: tomatoBreak, pomo-stop visible, skip-to-break hidden, quick-settings hidden

*Requires short-timer fixture (pomo = 1 min, break = 1 min).*

**Steps:**
1. Click `[data-testid='pomo-button']` to start the timer
2. Wait up to 75 s for the pomodoro to complete (`tomatoBreak` class on pomo-button)
   - expect: `[data-testid='pomo-button']` has CSS class `tomatoBreak`
   - expect: Break timer value is ≤ 60 seconds
   - expect: `[data-testid='pomo-stop']` is visible
   - expect: `[data-testid='skip-to-break']` is hidden
   - expect: `[data-testid='quick-settings']` is hidden

**Cleanup:** Click `[data-testid='pomo-stop']`.

---

## 3.6 break state UI: tomatoBreak, correct button visibility

*Requires short-timer fixture.*

**Steps:**
1. Click `[data-testid='pomo-button']`, wait for `tomatoBreak` class
   - expect: `[data-testid='pomo-button']` has CSS class `tomatoBreak`
   - expect: `[data-testid='pomo-stop']` is visible
   - expect: `[data-testid='quick-settings']` is not visible

**Cleanup:** Click `[data-testid='pomo-stop']`.

---

## 3.7 click pomo-stop during break → resets to idle: 00:00, tomatoWait, quick-settings visible

*Requires short-timer fixture.*

**Steps:**
1. Click `[data-testid='pomo-button']`, wait for `tomatoBreak` class
   - expect: `[data-testid='pomo-stop']` is visible
2. Click `[data-testid='pomo-stop']`
   - expect: `[data-testid='timer-display']` shows `'00:00'`
   - expect: `[data-testid='pomo-button']` has CSS class `tomatoWait`
   - expect: `[data-testid='quick-settings']` is visible
   - expect: `[data-testid='pomo-stop']` is hidden

---

## 3.8 break extension state: let break timer run past break duration → tomatoWarning class

*Requires short-timer fixture (break = 1 min).*

**Steps:**
1. Click `[data-testid='pomo-button']`, wait for `tomatoBreak` class (pomodoro completes)
   - expect: `[data-testid='pomo-button']` has class `tomatoBreak`
2. Wait for the break duration (1 min) to expire — wait for `tomatoWarning` class
   - expect: `[data-testid='pomo-button']` gains CSS class `tomatoWarning`

**Cleanup:** Click `[data-testid='pomo-stop']`.

---

## 3.9 long break: set PomoSetNum=2, complete 2 short pomodoros → long break triggers

*Requires short-timer fixture.*

**Steps:**
1. Configure `pomoSetNum = 2` via quick settings (`configureQuickSettings`)
2. Click `[data-testid='pomo-button']`, wait for first pomodoro to complete (`tomatoBreak`), then click `[data-testid='pomo-stop']`
3. Click `[data-testid='pomo-button']` again, wait for second pomodoro to complete (`tomatoBreak`)
   - expect: `[data-testid='pomo-button']` has CSS class `tomatoBreak`
   - expect: `[data-testid='pomo-stop']` is visible

**Cleanup:** Click `[data-testid='pomo-stop']`.
