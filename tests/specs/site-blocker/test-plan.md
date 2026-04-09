# Suite 8 — Site Blocker: ofex.me
# Suite 9 — Site Blocker: localhost (non-real site)

**Spec files:**
- `tests/specs/site-blocker/ofexme.spec.js` — Suites 8.1–8.8
- `tests/specs/site-blocker/localhost.spec.js` — Suites 9.1–9.5

**Constants:** `HOST_OFEX = 'ofex.me'`, `OFEX_DEMO_URL = 'https://ofex.me/animation-timer/'`, `HOST_LOCALHOST = 'localhost'`, `LOCALHOST_URL = 'http://localhost/'`

---

## Suite 8 — Site Blocker: ofex.me

### 8.1 'Block Site!' shown when ofex.me not blocked

**Steps:**
1. Open a new browser tab to `https://ofex.me/animation-timer/`, reload the popup
   - expect: `[data-testid='block-link']` has text matching `'Block Site!'`
   - expect: No row for `ofex.me` exists in `[data-testid='site-table']` (count = 0)

**Cleanup:** Close the extra tab.

---

### 8.2 block ofex.me: row appears, block-link changes to 'Un-Block Site', welcome-info hides

**Steps:**
1. Open a new tab to `https://ofex.me/animation-timer/`, reload the popup, click `[data-testid='block-link']`
   - expect: A row for `ofex.me` (`tbody#ofex.me`) becomes visible in `[data-testid='site-table']`
   - expect: `[data-testid='block-link']` text changes to `'Un-Block Site'`
   - expect: `[data-testid='welcome-info']` is no longer visible

**Cleanup:** Close the tab; remove `ofex.me` from blocked storage.

---

### 8.3 unblock ofex.me via block-link: row removed, link reverts to 'Block Site!'

**Fixture:** `injectBlockedSite` pre-injects `ofex.me` into storage.

**Steps:**
1. With `ofex.me` pre-blocked, open a new tab to `https://ofex.me/animation-timer/`, reload the popup
   - expect: `[data-testid='block-link']` has text `'Un-Block Site'`
2. Click `[data-testid='block-link']`
   - expect: `ofex.me` row count = 0 (removed from table)
   - expect: `[data-testid='block-link']` text reverts to `'Block Site!'`

**Cleanup:** Close the tab; restore original storage state.

---

### 8.4 blocked site row displays: hostname, hourglass+duration (30 min default), edit + delete buttons; buy cell shows cost 0

**Fixture:** `injectBlockedSite` with `{ hostname: 'ofex.me', cost: 0, passDuration: 30 }`, `ConnectHabitica: true` (required to render edit/buy cells).

**Steps:**
1. With `ofex.me` pre-blocked and `ConnectHabitica: true`, reload the popup
   - expect: `ofex.me` row (`tbody#ofex.me`) is visible
   - expect: Row contains text `'ofex.me'`
   - expect: Row contains text `'30'` (pass duration)
   - expect: Edit (pencil) button is visible in the row
   - expect: Delete (trash) button is visible in the row
   - expect: `[data-testid='site-buy']` cell is visible and contains text `'0'` (cost = 0, Habitica connected)

**Cleanup:** Restore original storage state.

---

### 8.5 edit pass duration: open edit row, change to 60, press Enter → 60 min persisted

**Fixture:** `injectBlockedSite` with `passDuration: 30`, `ConnectHabitica: true`.

**Steps:**
1. Click the edit (pencil) button in the `ofex.me` row
   - expect: Pass duration input appears within the row
2. Fill the input with `'60'`, press Enter
   - expect: Edit row closes
   - expect: `ofex.me` row contains text `'60'`
3. Reload the popup
   - expect: `ofex.me` row still contains text `'60'` (persisted)

**Cleanup:** Restore original storage state.

---

### 8.6 delete via trash button: row removed, block-link reverts, removed after reload

**Fixture:** `injectBlockedSite` with `passDuration: 30`.

**Steps:**
1. Click the delete (trash) button in the `ofex.me` row
   - expect: `ofex.me` row count = 0
   - expect: `[data-testid='block-link']` text reverts to `'Block Site!'`
2. Reload the popup
   - expect: `ofex.me` row count = 0 (removed from persistent storage)

**Cleanup:** Restore original storage state.

---

### 8.7 blocked CSS class during pomodoro: row gets 'blocked' class while timer running; class removed during break

**Fixture:** `popupPageShortTimerWithOfexBlocked` — short timer (pomo = 1 min) + `ofex.me` pre-blocked.

**Steps:**
1. Click `[data-testid='pomo-button']` to start the timer
   - expect: `ofex.me` row (`tbody#ofex.me`) has CSS class `blocked`
2. Wait for pomodoro to complete (`tomatoBreak` class on pomo-button)
   - expect: `ofex.me` row does **not** have CSS class `blocked`

**Cleanup:** Click `[data-testid='pomo-stop']`.

---

### 8.8 Stay Focused overlay shown on ofex.me tab during pomodoro

**Fixture:** `popupPageShortTimerWithOfexBlocked` — short timer + `ofex.me` pre-blocked; `activePage` is the real `ofex.me` tab.

**Steps:**
1. Bring the `ofex.me` tab to front, click `[data-testid='pomo-button']` to start the pomodoro, bring the `ofex.me` tab to front again
   - expect: `document.body` on the `ofex.me` tab gains CSS class `blockedSite` (within 20 s)
   - expect: `document.body` has attribute `data-html` containing text matching `'Stay Focused! Time Left:'`

**Cleanup:** Click `[data-testid='pomo-button']` (second click stops the timer during pomodoro).

---

## Suite 9 — Site Blocker: localhost (non-real site)

### 9.1 'Block Site!' shown when localhost not blocked

**Steps:**
1. Open a new browser tab to `http://localhost/` (navigation may fail — ignore error), reload the popup
   - expect: `[data-testid='block-link']` has text matching `'Block Site!'`
   - expect: No row for `localhost` exists in `[data-testid='site-table']` (count = 0)

**Cleanup:** Close the extra tab.

---

### 9.2 block localhost: row appears, link changes to 'Un-Block Site'

**Steps:**
1. Open a new tab to `http://localhost/`, reload the popup, click `[data-testid='block-link']`
   - expect: A row for `localhost` becomes visible in `[data-testid='site-table']`
   - expect: `[data-testid='block-link']` text changes to `'Un-Block Site'`

**Cleanup:** Close the tab; remove `localhost` from blocked storage.

---

### 9.3 unblock localhost via block-link: row removed, link reverts

**Fixture:** `injectBlockedSite` pre-injects `localhost` into storage.

**Steps:**
1. With `localhost` pre-blocked, open a new tab to `http://localhost/`, reload the popup
   - expect: `[data-testid='block-link']` has text `'Un-Block Site'`
2. Click `[data-testid='block-link']`
   - expect: `localhost` row count = 0
   - expect: `[data-testid='block-link']` text reverts to `'Block Site!'`

**Cleanup:** Close the tab; restore original storage state.

---

### 9.4 delete localhost via trash button: row removed, link reverts

**Fixture:** `injectBlockedSite` pre-injects `localhost`.

**Steps:**
1. Click the delete (trash) button in the `localhost` row
   - expect: `localhost` row count = 0
   - expect: `[data-testid='block-link']` text reverts to `'Block Site!'`

**Cleanup:** Restore original storage state.

---

### 9.5 blocked CSS class during pomodoro: localhost row gets 'blocked' class while timer running; removed during break

**Fixture:** `popupPageShortTimerWithLocalhostBlocked` — short timer (pomo = 1 min) + `localhost` pre-blocked.

**Steps:**
1. Click `[data-testid='pomo-button']` to start the timer
   - expect: `localhost` row has CSS class `blocked`
2. Wait for pomodoro to complete (`tomatoBreak` class)
   - expect: `localhost` row does **not** have CSS class `blocked`

**Cleanup:** Click `[data-testid='pomo-stop']`.
