# Habitica Pomodoro SiteKeeper – Popup Test Plan

## Application Overview

The Habitica Pomodoro SiteKeeper is a Chrome extension that combines a Pomodoro productivity timer with a site blocker and optional Habitica RPG integration. The popup (popup/popup.html) is the primary user interface, surfacing: a Pomodoro timer (tomato button + countdown display), a navigation menu (Settings, History, Feedback, Donate), a Settings panel with three sub-tabs (Timer, Habitica, Blocker), a History panel with charts and statistics, and a site-blocker section. This test plan covers all functionality testable in an offline environment with ConnectHabitica = OFF (no live Habitica connection). All Habitica-gated features — elements with class `.habitica-setting`, the footer, gold/HP display, credential error alert, vacation mode, free-pass scheduling, mobile notifications, and habit rewards — are intentionally excluded. Site-blocker tests use `ofex.me` (real site) and `localhost` (non-real). History panel tests pre-load `tests/fixtures/HistoryTestData.json` as fixture data.

## Test Scenarios

### 1. Suite 1 — Popup Initial Load & UI Elements

**Seed:** `tests/popup.spec.js`

#### 1.1. should display main container with all top-level UI sections visible; footer NOT visible

**File:** `tests/specs/popup-ui/should-display-main-container-on-load.spec.js`

**Steps:**
  1. Open the extension popup (navigate to popup/popup.html) with ConnectHabitica = false and no prior state
    - expect: Element [data-testid='main-container'] is visible
    - expect: Element [data-testid='menu-container'] is visible with 4 menu items
    - expect: Element [data-testid='pomodoro-section'] is visible
    - expect: Element [data-testid='timer-display'] shows '00:00'
    - expect: Element [data-testid='pomo-button'] is visible with class 'tomatoWait'
    - expect: Element [data-testid='block-link'] is visible
    - expect: Element [data-testid='site-table'] is present in the DOM
    - expect: Element [data-testid='footer'] is NOT visible (Habitica disconnected)

#### 1.2. should show welcome info when no sites are blocked; block-link shows 'Block Site!'

**File:** `tests/specs/popup-ui/should-show-welcome-info-when-no-sites-blocked.spec.js`

**Steps:**
  1. Open the popup with no blocked sites in storage and ConnectHabitica = false
    - expect: Element [data-testid='welcome-info'] is visible inside [data-testid='site-table']
    - expect: The welcome message text instructs the user to navigate to a site and click 'Block Site'
    - expect: Element [data-testid='block-link'] shows the text 'Block Site!'

#### 1.3. should NOT show save button on initial load (no panel open)

**File:** `tests/specs/popup-ui/should-not-show-save-button-on-load.spec.js`

**Steps:**
  1. Open the popup without clicking any menu item
    - expect: Element [data-testid='save-button'] is not visible
    - expect: No settings, history, feedback, or donate panels are visible

#### 1.4. should display open-in-new-window button and open new window on click

**File:** `tests/specs/popup-ui/should-display-new-window-button.spec.js`

**Steps:**
  1. Open the popup and locate [data-testid='popup-new-window']
    - expect: Element [data-testid='popup-new-window'] is visible inside [data-testid='pomodoro-section']
  2. Click [data-testid='popup-new-window']
    - expect: A new browser window/tab opens displaying popup.html

### 2. Suite 2 — Menu Navigation

**Seed:** `tests/popup.spec.js`

#### 2.1. should open Settings panel on SETTINGS click; Timer sub-tab active by default; save button appears

**File:** `tests/specs/menu/should-open-settings-panel.spec.js`

**Steps:**
  1. Verify [data-testid='settings-panel'] is not visible
    - expect: [data-testid='settings-panel'] is hidden
  2. Click [data-testid='menu-settings-trigger']
    - expect: [data-testid='settings-panel'] becomes visible
    - expect: [data-testid='save-button'] is visible
    - expect: The Timer sub-tab content is displayed by default (pomo-duration field is visible)

#### 2.2. should close Settings panel on second SETTINGS click; save button hides

**File:** `tests/specs/menu/should-close-settings-panel-on-second-click.spec.js`

**Steps:**
  1. Click [data-testid='menu-settings-trigger'] to open the Settings panel
    - expect: [data-testid='settings-panel'] is visible
    - expect: [data-testid='save-button'] is visible
  2. Click [data-testid='menu-settings-trigger'] again to toggle it closed
    - expect: [data-testid='settings-panel'] is hidden
    - expect: [data-testid='save-button'] is hidden

#### 2.3. should open History panel on HISTORY click

**File:** `tests/specs/menu/should-open-history-panel.spec.js`

**Steps:**
  1. Click [data-testid='menu-history-trigger']
    - expect: [data-testid='history-panel'] becomes visible
    - expect: [data-testid='pomo-today'] is visible
    - expect: [data-testid='hours-today'] is visible
    - expect: [data-testid='history-chart'] canvas is visible

#### 2.4. should open Feedback panel with all links visible

**File:** `tests/specs/menu/should-open-feedback-panel.spec.js`

**Steps:**
  1. Click [data-testid='menu-feedback-trigger']
    - expect: [data-testid='feedback-panel'] becomes visible
    - expect: [data-testid='rate-and-review-link'] is visible
    - expect: A bug report / feature request link is visible
    - expect: A Wiki page link is visible
    - expect: A 'What is Pomodoro?' link is visible

#### 2.5. should open Donate panel with Ko-fi link visible

**File:** `tests/specs/menu/should-open-donate-panel.spec.js`

**Steps:**
  1. Click [data-testid='menu-donate-trigger']
    - expect: [data-testid='donate-panel'] becomes visible
    - expect: A Ko-fi donation link is visible inside the donate panel

#### 2.6. should switch between panels: Settings → History → Feedback; each previous panel hides

**File:** `tests/specs/menu/should-switch-panels-correctly.spec.js`

**Steps:**
  1. Click [data-testid='menu-settings-trigger']
    - expect: [data-testid='settings-panel'] is visible
    - expect: [data-testid='history-panel'] is hidden
  2. Click [data-testid='menu-history-trigger']
    - expect: [data-testid='history-panel'] is visible
    - expect: [data-testid='settings-panel'] is hidden
  3. Click [data-testid='menu-feedback-trigger']
    - expect: [data-testid='feedback-panel'] is visible
    - expect: [data-testid='history-panel'] is hidden

### 3. Suite 3 — Pomodoro Timer: Core Functionality

**Seed:** `tests/popup.spec.js`

#### 3.1. idle state: timer shows 00:00, tomatoWait class, quick-settings visible, pomo-stop/skip/freeze hidden

**File:** `tests/specs/timer/should-display-idle-state.spec.js`

**Steps:**
  1. Open popup in fresh idle state (timer not running)
    - expect: [data-testid='timer-display'] shows '00:00'
    - expect: [data-testid='pomo-button'] has CSS class 'tomatoWait'
    - expect: [data-testid='quick-settings'] is visible
    - expect: [data-testid='pomo-stop'] is hidden
    - expect: [data-testid='skip-to-break'] is hidden
    - expect: [data-testid='pomo-freeze'] is hidden

#### 3.2. start timer: click pomo-button → tomatoProgress class, timer counts down, quick-settings hides

**File:** `tests/specs/timer/should-start-timer-on-button-click.spec.js`

**Steps:**
  1. Click [data-testid='pomo-button']
    - expect: [data-testid='pomo-button'] gains CSS class 'tomatoProgress'
    - expect: [data-testid='quick-settings'] is hidden
  2. Wait 2 seconds
    - expect: [data-testid='timer-display'] shows a value less than the starting duration (timer is counting down)
    - expect: Timer display matches MM:SS format

#### 3.3. skip-to-break: enable in Settings, start timer, click skip → enters break state

**File:** `tests/specs/timer/should-skip-to-break-when-enabled.spec.js`

**Steps:**
  1. Open Settings panel, switch to Timer tab, check [data-testid='show-skip-to-break'], click [data-testid='save-button']
    - expect: showSkipToBreak setting is saved
  2. Click [data-testid='pomo-button'] to start the timer
    - expect: [data-testid='skip-to-break'] button is visible
  3. Click [data-testid='skip-to-break']
    - expect: [data-testid='pomo-button'] gains CSS class 'tomatoBreak'
    - expect: Timer transitions to break countdown
    - expect: [data-testid='pomo-stop'] is visible

#### 3.4. freeze/pause: enable in Settings, start timer, click freeze → timer stops (tomatoFreeze), click resume → counts again

**File:** `tests/specs/timer/should-freeze-and-resume-timer.spec.js`

**Steps:**
  1. Open Settings panel, switch to Timer tab, check [data-testid='show-freeze'], click [data-testid='save-button']
    - expect: showFreeze setting is saved
  2. Click [data-testid='pomo-button'] to start the timer
    - expect: [data-testid='pomo-freeze'] is visible
  3. Note the current timer value, then click [data-testid='pomo-freeze']
    - expect: [data-testid='pomo-button'] gains CSS class 'tomatoFreeze'
    - expect: Timer display is frozen (same value after 2 seconds)
  4. Click [data-testid='pomo-button'] (or [data-testid='pomo-freeze']) to resume
    - expect: [data-testid='pomo-button'] regains class 'tomatoProgress'
    - expect: Timer resumes counting down

#### 3.5. complete short pomodoro → break state: tomatoBreak, pomo-stop visible, skip-to-break hidden, quick-settings hidden

**File:** `tests/specs/timer/should-enter-break-after-pomodoro.spec.js`

**Steps:**
  1. Set pomo duration to 1 minute via quick settings, then click pomo-button to start
    - expect: Timer runs and counts down
  2. Wait for the 1-minute pomodoro to complete
    - expect: [data-testid='pomo-button'] gains CSS class 'tomatoBreak'
    - expect: [data-testid='pomo-stop'] is visible
    - expect: [data-testid='skip-to-break'] is hidden
    - expect: [data-testid='quick-settings'] is hidden

#### 3.6. break state UI: cornflower-blue background, correct button visibility

**File:** `tests/specs/timer/should-display-break-state-ui.spec.js`

**Steps:**
  1. Set pomo duration to 1 minute, start timer, wait for pomodoro to complete and break to begin
    - expect: [data-testid='pomo-button'] has CSS class 'tomatoBreak'
    - expect: Popup background is cornflower blue (CSS variable or computed style)
    - expect: [data-testid='pomo-stop'] is visible
    - expect: [data-testid='quick-settings'] is not visible

#### 3.7. click pomo-stop during break → resets to idle: 00:00, tomatoWait, quick-settings visible

**File:** `tests/specs/timer/should-reset-to-idle-on-stop.spec.js`

**Steps:**
  1. Set pomo duration to 1 minute, start timer, wait for break to begin
    - expect: [data-testid='pomo-stop'] is visible
  2. Click [data-testid='pomo-stop']
    - expect: [data-testid='timer-display'] shows '00:00'
    - expect: [data-testid='pomo-button'] regains CSS class 'tomatoWait'
    - expect: [data-testid='quick-settings'] is visible
    - expect: [data-testid='pomo-stop'] is hidden

#### 3.8. break extension state: let break timer run past break duration → tomatoWarning class

**File:** `tests/specs/timer/should-enter-break-extension-state.spec.js`

**Steps:**
  1. Set pomo duration to 1 minute and break duration to 1 minute via quick settings, start timer, wait for break to begin
    - expect: [data-testid='pomo-button'] has class 'tomatoBreak'
  2. Wait for the break duration to expire (1 minute)
    - expect: [data-testid='pomo-button'] gains CSS class 'tomatoWarning'
    - expect: Timer continues counting up or displays break-extension countdown

#### 3.9. long break: set PomoSetNum=2, complete 2 short pomodoros → long break triggers, set counter resets

**File:** `tests/specs/timer/should-trigger-long-break-after-set.spec.js`

**Steps:**
  1. Open quick settings, set pomo duration to 1 min, break duration to 1 min, pomo set num to 2, save with [data-testid='quick-save']
    - expect: Quick settings panel closes
  2. Click pomo-button, wait for first pomodoro to complete and break to begin, then click pomo-stop, click pomo-button again to start second pomodoro, wait for second pomodoro to complete
    - expect: [data-testid='pomo-button'] gains CSS class 'tomatoBreak' (long break)
    - expect: Long-break duration is used (not short break)
    - expect: Set counter display resets to 0 or shows --/--

### 4. Suite 4 — Quick Settings

**Seed:** `tests/popup.spec.js`

#### 4.1. open quick-settings overlay: gear icon click → overlay appears, fields pre-filled, pomodoro section hides

**File:** `tests/specs/quick-settings/should-open-quick-settings-overlay.spec.js`

**Steps:**
  1. Click [data-testid='quick-settings'] (gear icon)
    - expect: [data-testid='quick-settings-panel'] becomes visible
    - expect: [data-testid='quick-set-pomo-duration'] is visible and pre-filled (default 25)
    - expect: [data-testid='quick-set-break-duration'] is visible and pre-filled (default 5)
    - expect: [data-testid='quick-set-long-break-duration'] is visible and pre-filled (default 30)
    - expect: [data-testid='quick-set-pomo-set-num'] is visible and pre-filled (default 4)
    - expect: [data-testid='pomodoro-section'] main timer area is hidden while overlay is open

#### 4.2. save quick settings: change pomo duration to 30, click OK, panel closes, duration persisted

**File:** `tests/specs/quick-settings/should-save-quick-settings.spec.js`

**Steps:**
  1. Click [data-testid='quick-settings'], clear [data-testid='quick-set-pomo-duration'] and type '30'
    - expect: [data-testid='quick-set-pomo-duration'] shows value '30'
  2. Click [data-testid='quick-save']
    - expect: [data-testid='quick-settings-panel'] hides
    - expect: [data-testid='pomodoro-section'] is visible again
  3. Click [data-testid='quick-settings'] again to reopen
    - expect: [data-testid='quick-set-pomo-duration'] shows value '30' (persisted)

#### 4.3. take manual break: set duration to 5, click take-break arrow → break starts, set counter shows --/--

**File:** `tests/specs/quick-settings/should-take-manual-break.spec.js`

**Steps:**
  1. Click [data-testid='quick-settings'], set [data-testid='quick-set-take-break-duration'] to 5
    - expect: [data-testid='quick-set-take-break-duration'] shows value '5'
  2. Click [data-testid='quick-set-take-break']
    - expect: [data-testid='quick-settings-panel'] closes
    - expect: [data-testid='pomo-button'] has CSS class 'tomatoBreak' (break state active)
    - expect: Timer counts down from 5 minutes
    - expect: Set counter area shows '--/--' or equivalent to indicate manual break

### 5. Suite 5 — Settings: Timer Tab

**Seed:** `tests/popup.spec.js`

#### 5.1. all fields visible with correct defaults: pomo=25, break=5, long-break=30, set=4, extension=2; checkboxes and sounds

**File:** `tests/specs/settings-timer/should-display-timer-defaults.spec.js`

**Steps:**
  1. Click [data-testid='menu-settings-trigger'] to open Settings panel (Timer tab is active by default)
    - expect: [data-testid='pomo-duration'] value is '25'
    - expect: [data-testid='break-duration'] value is '5'
    - expect: [data-testid='long-break-duration'] value is '30'
    - expect: [data-testid='pomo-set-num'] value is '4'
    - expect: [data-testid='break-extension'] value is '2'
    - expect: [data-testid='show-skip-to-break'] checkbox is unchecked
    - expect: [data-testid='show-freeze'] checkbox is unchecked
    - expect: [data-testid='manual-break'] checkbox is checked
    - expect: [data-testid='reset-pomo-after-break'] checkbox is unchecked
    - expect: [data-testid='pomodoro-end-sound'] select is visible (default 'None')
    - expect: [data-testid='break-end-sound'] select is visible (default 'None')
    - expect: [data-testid='ambient-sound'] select is visible (default 'None')

#### 5.2. save pomo duration: change to 35, save, reload popup, verify 35

**File:** `tests/specs/settings-timer/should-save-pomo-duration.spec.js`

**Steps:**
  1. Open Settings > Timer tab, clear [data-testid='pomo-duration'] and type '35', click [data-testid='save-button']
    - expect: Save button shows confirmation (or panel stays open)
  2. Reload the popup page (navigate again to popup.html)
    - expect: After reopening Settings > Timer tab, [data-testid='pomo-duration'] shows '35'

#### 5.3. save break duration: change to 10, save, reload popup, verify 10

**File:** `tests/specs/settings-timer/should-save-break-duration.spec.js`

**Steps:**
  1. Open Settings > Timer tab, clear [data-testid='break-duration'] and type '10', click [data-testid='save-button']
    - expect: Settings saved
  2. Reload the popup page
    - expect: After reopening Settings > Timer tab, [data-testid='break-duration'] shows '10'

#### 5.4. enable skip-to-break toggle, save, reload → checkbox remains checked; timer shows >> button when running

**File:** `tests/specs/settings-timer/should-persist-skip-to-break-setting.spec.js`

**Steps:**
  1. Open Settings > Timer tab, check [data-testid='show-skip-to-break'], click [data-testid='save-button']
    - expect: Settings saved
  2. Reload the popup page
    - expect: After reopening Settings > Timer tab, [data-testid='show-skip-to-break'] is checked
  3. Click [data-testid='pomo-button'] to start the timer
    - expect: [data-testid='skip-to-break'] button (>>) is visible during the running pomodoro

#### 5.5. enable freeze toggle, save, reload → checkbox remains checked; timer shows snowflake button when running

**File:** `tests/specs/settings-timer/should-persist-freeze-setting.spec.js`

**Steps:**
  1. Open Settings > Timer tab, check [data-testid='show-freeze'], click [data-testid='save-button']
    - expect: Settings saved
  2. Reload the popup page
    - expect: After reopening Settings > Timer tab, [data-testid='show-freeze'] is checked
  3. Click [data-testid='pomo-button'] to start the timer
    - expect: [data-testid='pomo-freeze'] button (snowflake) is visible during the running pomodoro

#### 5.6. select pomodoro end sound (Sound1) and ambient sound (Ambient Rain), verify selections persist

**File:** `tests/specs/settings-timer/should-save-sound-selections.spec.js`

**Steps:**
  1. Open Settings > Timer tab, select 'Sound1' from [data-testid='pomodoro-end-sound'], select 'Ambient Rain' from [data-testid='ambient-sound'], click [data-testid='save-button']
    - expect: Settings saved
  2. Reload the popup and reopen Settings > Timer tab
    - expect: [data-testid='pomodoro-end-sound'] selected value is 'Sound1'
    - expect: [data-testid='ambient-sound'] selected value is 'Ambient Rain'

### 6. Suite 6 — Settings: Habitica Tab (UI Only, no API calls)

**Seed:** `tests/popup.spec.js`

#### 6.1. Habitica tab with toggle OFF → all .habitica-setting elements faded (opacity ~0.3), footer hidden

**File:** `tests/specs/settings-habitica/should-fade-habitica-settings-when-disconnected.spec.js`

**Steps:**
  1. Open Settings panel, click [data-testid='inner-menu-habitica'] label to switch to Habitica tab (using evaluate to click the hidden radio input)
    - expect: [data-testid='connect-habitica'] toggle is OFF (unchecked)
    - expect: All elements with CSS class 'habitica-setting' have reduced opacity (approximately 0.3)
    - expect: [data-testid='uid'] input is visible but faded
    - expect: [data-testid='api-token'] input is visible but faded
    - expect: [data-testid='footer'] is not visible

#### 6.2. toggle ConnectHabitica ON → habitica-setting elements restore full opacity; toggle OFF again → elements fade back

**File:** `tests/specs/settings-habitica/should-toggle-habitica-setting-opacity.spec.js`

**Steps:**
  1. Open Settings > Habitica tab, click [data-testid='connect-habitica'] to toggle ON
    - expect: All elements with CSS class 'habitica-setting' have full opacity (1.0)
    - expect: [data-testid='uid'] and [data-testid='api-token'] are fully visible
  2. Click [data-testid='connect-habitica'] again to toggle OFF
    - expect: All elements with CSS class 'habitica-setting' return to reduced opacity (~0.3)

### 7. Suite 7 — Settings: Blocker Tab (offline-only features)

**Seed:** `tests/popup.spec.js`

#### 7.1. Blocker tab displays: hide-edit, mute-blocked-sites, transparent-overlay checkboxes and whitelist textarea all visible

**File:** `tests/specs/settings-blocker/should-display-blocker-settings.spec.js`

**Steps:**
  1. Open Settings panel, click [data-testid='inner-menu-blocker'] label to switch to Blocker tab
    - expect: [data-testid='hide-edit'] checkbox is visible
    - expect: [data-testid='mute-blocked-sites'] checkbox is visible
    - expect: [data-testid='transparent-overlay'] checkbox is visible
    - expect: [data-testid='whitelist'] textarea is visible
    - expect: [data-testid='vacation-mode'], [data-testid='break-free-pass'], and [data-testid='free-pass-blocks'] are present in DOM but have 'habitica-setting' class (gated, not tested functionally)

#### 7.2. save whitelist entry: type 'ofex.me/animation-timer', save, reload, verify persisted

**File:** `tests/specs/settings-blocker/should-save-whitelist-entry.spec.js`

**Steps:**
  1. Open Settings > Blocker tab, click [data-testid='whitelist'] textarea and type 'ofex.me/animation-timer', click [data-testid='save-button']
    - expect: Settings saved
  2. Reload the popup and reopen Settings > Blocker tab
    - expect: [data-testid='whitelist'] textarea contains 'ofex.me/animation-timer'

#### 7.3. enable hide-edit option with a blocked site → edit/delete buttons and block-link hide after save

**File:** `tests/specs/settings-blocker/should-hide-edit-controls-when-enabled.spec.js`

**Steps:**
  1. Ensure at least one site (e.g. ofex.me) is blocked, then open Settings > Blocker tab, check [data-testid='hide-edit'], click [data-testid='save-button']
    - expect: Settings saved
  2. Return to main popup view (close Settings panel)
    - expect: Edit (pencil) button for the blocked site row is not visible
    - expect: Delete (trash) button for the blocked site row is not visible
    - expect: [data-testid='block-link'] is not visible

### 8. Suite 8 — Site Blocker: ofex.me

**Seed:** `tests/popup.spec.js`

#### 8.1. 'Block Site!' shown when ofex.me not blocked (navigate tab to https://ofex.me/animation-timer/)

**File:** `tests/specs/site-blocker/ofexme/should-show-block-site-link-when-not-blocked.spec.js`

**Steps:**
  1. Navigate the active browser tab to https://ofex.me/animation-timer/, then open the extension popup
    - expect: [data-testid='block-link'] shows the text 'Block Site!'
    - expect: No row for 'ofex.me' exists in [data-testid='site-table']

#### 8.2. block ofex.me: row fades into table, block-link changes to 'Un-Block Site', persisted to storage

**File:** `tests/specs/site-blocker/ofexme/should-block-ofexme.spec.js`

**Steps:**
  1. Navigate active tab to https://ofex.me/animation-timer/, open popup, click [data-testid='block-link']
    - expect: A new row for 'ofex.me' appears in [data-testid='site-table']
    - expect: [data-testid='block-link'] text changes to 'Un-Block Site'
    - expect: The 'ofex.me' row shows hostname, hourglass icon with pass duration (default 30 min), edit button, and delete button
    - expect: [data-testid='welcome-info'] is no longer visible

#### 8.3. unblock ofex.me via block-link: row fades out, block-link reverts to 'Block Site!'

**File:** `tests/specs/site-blocker/ofexme/should-unblock-ofexme-via-link.spec.js`

**Steps:**
  1. Ensure ofex.me is blocked, navigate to https://ofex.me/animation-timer/, open popup, click [data-testid='block-link'] (now 'Un-Block Site')
    - expect: The 'ofex.me' row is removed from [data-testid='site-table']
    - expect: [data-testid='block-link'] text reverts to 'Block Site!'
    - expect: [data-testid='welcome-info'] becomes visible again

#### 8.4. blocked site row displays: hostname, hourglass+duration (30min default), edit button, delete button; buy button NOT visible

**File:** `tests/specs/site-blocker/ofexme/should-display-blocked-site-row.spec.js`

**Steps:**
  1. Ensure ofex.me is blocked, open the popup
    - expect: The 'ofex.me' tbody row (locator 'tbody#ofex.me') is visible in [data-testid='site-table']
    - expect: Row shows the hostname 'ofex.me'
    - expect: Row shows a hourglass icon and '30' minute pass duration
    - expect: Edit (pencil) button is visible in the row
    - expect: Delete (trash) button is visible in the row
    - expect: No 'buy with gold' button is visible (requires Habitica connection)

#### 8.5. edit pass duration: open edit row, change to 60, press Enter → row closes, 60min persisted

**File:** `tests/specs/site-blocker/ofexme/should-edit-pass-duration.spec.js`

**Steps:**
  1. Ensure ofex.me is blocked, open popup, click the edit (pencil) button in the 'ofex.me' row
    - expect: An edit input for pass duration appears within the row
  2. Clear the pass duration input, type '60', press Enter
    - expect: The edit row closes
    - expect: The 'ofex.me' row now shows '60' min as the pass duration
  3. Reload the popup
    - expect: 'ofex.me' row still shows '60' min (persisted to storage)

#### 8.6. delete via trash button: row removed, block-link reverts, removed from storage

**File:** `tests/specs/site-blocker/ofexme/should-delete-blocked-site-via-trash.spec.js`

**Steps:**
  1. Ensure ofex.me is blocked (navigate to ofex.me, click Block Site), open popup, click the delete (trash) button in the 'ofex.me' row
    - expect: The 'ofex.me' row is removed from [data-testid='site-table']
    - expect: [data-testid='block-link'] text reverts to 'Block Site!'
    - expect: [data-testid='welcome-info'] becomes visible again
  2. Reload the popup
    - expect: 'ofex.me' row is not present (removed from persistent storage)

#### 8.7. blocked CSS state during pomodoro: rows get 'blocked' class while timer running; class removed during break

**File:** `tests/specs/site-blocker/ofexme/should-apply-blocked-class-during-pomodoro.spec.js`

**Steps:**
  1. Ensure ofex.me is blocked, open popup, click [data-testid='pomo-button'] to start the timer
    - expect: The 'ofex.me' row in [data-testid='site-table'] gains CSS class 'blocked'
  2. Set pomo duration short (1 min) and wait for break to begin
    - expect: The 'ofex.me' row no longer has CSS class 'blocked' during the break

### 9. Suite 9 — Site Blocker: localhost (non-real site)

**Seed:** `tests/popup.spec.js`

#### 9.1. 'Block Site!' shown when localhost not blocked (open tab to http://localhost/)

**File:** `tests/specs/site-blocker/localhost/should-show-block-site-for-localhost.spec.js`

**Steps:**
  1. Open a browser tab to http://localhost/ (even if no server is running), then open the extension popup
    - expect: [data-testid='block-link'] shows 'Block Site!'
    - expect: No row for 'localhost' exists in [data-testid='site-table']

#### 9.2. block localhost: row appears, link changes to 'Un-Block Site', no JS console errors

**File:** `tests/specs/site-blocker/localhost/should-block-localhost.spec.js`

**Steps:**
  1. With a tab open to http://localhost/, open popup, click [data-testid='block-link']
    - expect: A row for 'localhost' appears in [data-testid='site-table']
    - expect: [data-testid='block-link'] text changes to 'Un-Block Site'
    - expect: No JavaScript console errors are thrown

#### 9.3. unblock localhost via block-link: row removed, link reverts, no JS errors

**File:** `tests/specs/site-blocker/localhost/should-unblock-localhost-via-link.spec.js`

**Steps:**
  1. Ensure localhost is blocked, open popup with localhost tab active, click [data-testid='block-link'] (Un-Block Site)
    - expect: 'localhost' row is removed from [data-testid='site-table']
    - expect: [data-testid='block-link'] reverts to 'Block Site!'
    - expect: No JavaScript console errors

#### 9.4. delete localhost via trash button: row removed, link reverts, no JS errors

**File:** `tests/specs/site-blocker/localhost/should-delete-localhost-via-trash.spec.js`

**Steps:**
  1. Ensure localhost is blocked, open popup, click the delete (trash) button in the 'localhost' row
    - expect: 'localhost' row is removed from [data-testid='site-table']
    - expect: [data-testid='block-link'] reverts to 'Block Site!'
    - expect: No JavaScript console errors

### 10. Suite 10 — History Panel (with fixture data)

**Seed:** `tests/popup.spec.js`

#### 10.1. pre-load HistoryTestData.json fixture; open History panel → pomo-total and hours-total show non-zero values

**File:** `tests/specs/history/should-display-history-stats-from-fixture.spec.js`

**Steps:**
  1. Pre-load tests/fixtures/HistoryTestData.json into extension storage, then open the popup and click [data-testid='menu-history-trigger']
    - expect: [data-testid='history-panel'] is visible
    - expect: [data-testid='pomo-total'] shows a non-zero value (from fixture)
    - expect: [data-testid='hours-total'] shows a non-zero value (from fixture)
    - expect: [data-testid='pomo-avg'] shows a non-zero average
    - expect: [data-testid='hours-avg'] shows a non-zero average

#### 10.2. chart renders: canvas visible, summary label shows 'Sum: X | Avg: Y'

**File:** `tests/specs/history/should-render-history-chart.spec.js`

**Steps:**
  1. Pre-load fixture data, open popup, click [data-testid='menu-history-trigger']
    - expect: [data-testid='history-chart'] canvas element is visible
    - expect: [data-testid='history-chart-total'] contains text matching 'Sum:' and 'Avg:'

#### 10.3. toggle chart view: Pomodoros → Hours → Pomodoros

**File:** `tests/specs/history/should-toggle-chart-view.spec.js`

**Steps:**
  1. Pre-load fixture, open History panel; note the chart-total label in Pomodoros view, then click [data-testid='history-chart-show-hours']
    - expect: Chart switches to Hours view; [data-testid='history-chart-total'] updates to reflect hours data
  2. Click [data-testid='history-chart-show-pomodoros']
    - expect: Chart switches back to Pomodoros view; [data-testid='history-chart-total'] reverts to pomodoro data

#### 10.4. navigate prev/next: click prev arrow → chart shifts to earlier 7-day window; click next → returns

**File:** `tests/specs/history/should-navigate-chart-windows.spec.js`

**Steps:**
  1. Pre-load fixture, open History panel, note [data-testid='history-chart-total'] summary, click [data-testid='history-chart-prev']
    - expect: [data-testid='history-chart-total'] updates to reflect an earlier 7-day window
  2. Click [data-testid='history-chart-next']
    - expect: [data-testid='history-chart-total'] returns to the most-recent 7-day window

#### 10.5. Full History & Backup link visible and opens fullHistory.html in new tab

**File:** `tests/specs/history/should-open-full-history-link.spec.js`

**Steps:**
  1. Open History panel, locate [data-testid='backup-link']
    - expect: [data-testid='backup-link'] is visible
  2. Click [data-testid='backup-link']
    - expect: A new tab opens with fullHistory.html

#### 10.6. backup data warning visible in history panel

**File:** `tests/specs/history/should-display-backup-data-warning.spec.js`

**Steps:**
  1. Open the History panel by clicking [data-testid='menu-history-trigger']
    - expect: [data-testid='backup-data-warning'] is visible

#### 10.7. Download History: click download button → file download triggered (Histogram.json)

**File:** `tests/specs/history/should-download-histogram.spec.js`

**Steps:**
  1. Pre-load fixture, open History panel, set up a download listener, click [data-testid='download-histogram']
    - expect: A file download is triggered
    - expect: The downloaded file is named 'Histogram.json' (or similar)

#### 10.8. Import history: use import-histogram-file input and import button to load fixture JSON, then clear → statistics reset to 0

**File:** `tests/specs/history/should-import-and-clear-histogram.spec.js`

**Steps:**
  1. Open History panel, use [data-testid='import-histogram-file'] to select tests/fixtures/HistoryTestData.json, click [data-testid='import-histogram']
    - expect: [data-testid='pomo-total'] shows a non-zero value from the imported data
  2. Click [data-testid='clear-histogram']
    - expect: [data-testid='pomo-total'] resets to '0'
    - expect: [data-testid='hours-total'] resets to '0'
    - expect: [data-testid='pomo-avg'] resets to '0'

### 11. Suite 11 — Edge Cases

**Seed:** `tests/popup.spec.js`

#### 11.1. invalid pomo duration input ('abc') → save → previous valid value retained, no crash

**File:** `tests/specs/edge-cases/should-reject-invalid-pomo-duration.spec.js`

**Steps:**
  1. Open Settings > Timer tab, note the current pomo duration (e.g. 25), clear [data-testid='pomo-duration'] and type 'abc', click [data-testid='save-button']
    - expect: No JavaScript errors are thrown
    - expect: The pomo duration field retains the previous valid value (e.g. 25) or shows a validation error

#### 11.2. invalid pass duration input ('abc') on blocked site edit row → rejected/defaulted, no JS errors

**File:** `tests/specs/edge-cases/should-reject-invalid-pass-duration.spec.js`

**Steps:**
  1. Ensure ofex.me is blocked, open popup, click the edit (pencil) button in the ofex.me row, clear the pass duration input, type 'abc', press Enter
    - expect: No JavaScript console errors are thrown
    - expect: The pass duration is rejected or defaulted to a valid value (e.g. 30)

#### 11.3. rapid tomato clicks (5×) → no JS errors, timer state consistent

**File:** `tests/specs/edge-cases/should-handle-rapid-pomo-clicks.spec.js`

**Steps:**
  1. Click [data-testid='pomo-button'] 5 times in rapid succession
    - expect: No JavaScript console errors are thrown
    - expect: [data-testid='pomo-button'] is in a consistent CSS class state (tomatoWait or tomatoProgress)
    - expect: Timer display shows a valid MM:SS format

#### 11.4. timer state persists across popup close/reopen: start timer, close popup, reopen → timer still counting at lower value

**File:** `tests/specs/edge-cases/should-persist-timer-across-popup-close.spec.js`

**Steps:**
  1. Click [data-testid='pomo-button'] to start the timer, note the current timer value, close the popup page
    - expect: Timer starts counting
  2. Wait 3 seconds, then reopen the popup (navigate to popup.html again)
    - expect: [data-testid='pomo-button'] still has CSS class 'tomatoProgress'
    - expect: [data-testid='timer-display'] shows a value lower than the value noted before closing (timer continued running in background)
