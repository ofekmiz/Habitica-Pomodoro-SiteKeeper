# Habitica Pomodoro SiteKeeper - Popup Test Plan

## Application Overview

The Habitica Pomodoro SiteKeeper is a browser extension (Chrome/Firefox/Edge) that combines a Pomodoro timer with site blocking and optional Habitica RPG integration. The popup (popup/popup.html) is the main user interface, providing: a Pomodoro timer (tomato button + time display), navigation menu (Settings, History, Feedback, Coffee/Donate), Settings panel with three sub-sections (Timer, Habitica, Blocker), a History panel with charts and statistics, and a site blocker section showing blocked sites.

**Testing assumptions for all tests:**
- `ConnectHabitica` (`id="ConnectHabitica"`) is **OFF** (unchecked/false) for every test — no Habitica connection is required
- The Habitica footer (#Footer) will be hidden in all tests
- No Habitica API calls will be made
- Site blocking tests use `ofex.me` as the target site (https://ofex.me/animation-timer/ for whitelist)

## Test Suites Summary

| Suite | Tests | Coverage |
|---|---|---|
| **1. Popup Initial Load & UI Elements** | 4 | Main container, welcome message, save button, new-window button |
| **2. Menu Navigation** | 7 | Settings/History/Feedback/Donate panels, toggle behavior, scroll-to-top |
| **3. Pomodoro Timer - Core Functionality** | 11 | Idle state, start, progress, freeze/pause, skip-to-break, break transitions, break extension, long break, set counter |
| **4. Quick Settings** | 3 | Open/close quick settings, save settings, take manual break |
| **5. Settings - Timer Settings** | 6 | All timer fields with defaults, duration saving, sounds, skip-to-break toggle |
| **6. Settings - Habitica (UI state only)** | 4 | Toggle OFF/ON UI fading only — no API calls, no credentials |
| **7. Settings - Blocker Settings** | 6 | Whitelist (ofex.me), vacation mode, free pass schedules, hide edit options |
| **8. Site Blocker** | 9 | Block/unblock ofex.me, site rows, duration editing, delete, blocked CSS state, whitelist path |
| **9. History Panel** | 8 | Statistics display, bar chart, chart navigation, full history link, download/clear |
| **10. Edge Cases & Error States** | 6 | Invalid inputs, rapid clicks, timer persistence, vacation banners, Habitica UI hidden |
| **11. Site Blocker – localhost (non-real site)** | 4 | Block/unblock/delete a non-real localhost site, verify no JS errors |

**Total: 11 suites, 68 test cases — all runnable with ConnectHabitica = OFF**

**Intentionally excluded (requires live Habitica connection):**
- Habitica API calls (gold/HP fetch, stat refresh)
- Credential validation (UID + API token)
- Buying site passes with Habitica gold
- Credential error alert (requires 401 from Habitica server)
- Version update notification (requires server-side flag)
- Habitica habit/combo rewards on pomodoro completion

> **Note on Suite 11 (localhost):** A background tab is navigated to `http://localhost/` so the extension reads `localhost` as the active tab's hostname. No real local server is needed.

## Test Scenarios

### 1. Popup Initial Load & UI Elements

**Seed:** `tests/seed.spec.ts`

#### 1.1. should display main container with all top-level UI sections on load

**File:** `tests/specs/popup-ui/should-display-main-container-on-load.spec.js`

**Steps:**
  1. Open the extension popup (navigate to popup/popup.html) with ConnectHabitica = false
    - expect: The main container (#mainContainer) is visible
    - expect: The menu bar (#MenuContainer) is visible with 4 items: SETTINGS, HISTORY, FEEDBACK, COFFEE
    - expect: The pomodoro section (#pomodoro) is visible
    - expect: The timer display (#Time) shows '00:00'
    - expect: The tomato button (#PomoButton) is visible with class 'tomato tomatoWait'
    - expect: The block site link (#BlockLink) is visible
    - expect: The site table (#SiteTable) is visible
    - expect: The footer (#Footer) is NOT visible (Habitica disconnected)

#### 1.2. should show welcome info message when no sites are blocked

**File:** `tests/specs/popup-ui/should-show-welcome-info-when-no-sites-blocked.spec.js`

**Steps:**
  1. Open the popup with no blocked sites in storage and ConnectHabitica = false
    - expect: The #SiteTable contains a welcome info paragraph (#welcomeInfo)
    - expect: The welcome message instructs the user to navigate to sites and click 'Block Site'
    - expect: The #BlockLink shows 'Block Site!' text

#### 1.3. should not show save button on initial load

**File:** `tests/specs/popup-ui/should-not-show-save-button-on-load.spec.js`

**Steps:**
  1. Open the popup without clicking any menu item
    - expect: The Save Button (#SaveButton) is not visible
    - expect: No settings panels are open

#### 1.4. should display popup open-in-new-window button

**File:** `tests/specs/popup-ui/should-display-new-window-button.spec.js`

**Steps:**
  1. Open the popup and locate the new-window button (#PopupNewWindow)
    - expect: The #PopupNewWindow button is visible in the pomodoro section
  2. Click the #PopupNewWindow button
    - expect: A new browser window opens displaying popup.html at 400x520 dimensions

### 2. Menu Navigation

**Seed:** `tests/seed.spec.ts`

#### 2.1. should open Settings panel when SETTINGS menu item is clicked

**File:** `tests/specs/menu/should-open-settings-panel.spec.js`

**Steps:**
  1. Open the popup
    - expect: Settings panel (#Settings) is not visible
  2. Click on the SETTINGS menu item label ([data-testid='menu-settings-trigger'])
    - expect: The Settings panel (#Settings) fades in and becomes visible
    - expect: The Save Button (#SaveButton) slides down and shows 'SAVE' text
    - expect: The SETTINGS menu item has the 'selected' CSS class
    - expect: The timer sub-menu tab (TIMER) is active by default showing timer settings

#### 2.2. should close Settings panel when SETTINGS menu item is clicked again

**File:** `tests/specs/menu/should-close-settings-panel-on-second-click.spec.js`

**Steps:**
  1. Open the popup and click SETTINGS to open it
    - expect: Settings panel is visible
  2. Click the SETTINGS menu item label again
    - expect: The Settings panel hides
    - expect: The Save Button hides
    - expect: The SETTINGS menu item loses the 'selected' CSS class

#### 2.3. should open History panel when HISTORY menu item is clicked

**File:** `tests/specs/menu/should-open-history-panel.spec.js`

**Steps:**
  1. Click on the HISTORY menu item label ([data-testid='menu-history-trigger'])
    - expect: The History panel (#History) becomes visible
    - expect: The Save Button slides down showing 'CLOSE' text
    - expect: The HISTORY menu item has the 'selected' CSS class
    - expect: Today's pomodoro count (#PomoToday) is displayed
    - expect: Today's hours count (#HoursToday) is displayed
    - expect: The history bar chart (#HistoryChart) is rendered

#### 2.4. should open Feedback panel when FEEDBACK menu item is clicked

**File:** `tests/specs/menu/should-open-feedback-panel.spec.js`

**Steps:**
  1. Click on the FEEDBACK menu item label ([data-testid='menu-feedback-trigger'])
    - expect: The Feedback panel (#Feedback) becomes visible
    - expect: A 'Rate & Review' link is visible
    - expect: A 'Report a bug / Suggest a feature' link to GitHub issues is visible
    - expect: A Wiki Page link is visible
    - expect: A 'What is Pomodoro?' link is visible

#### 2.5. should open Donate panel when COFFEE menu item is clicked

**File:** `tests/specs/menu/should-open-donate-panel.spec.js`

**Steps:**
  1. Click on the COFFEE menu item label
    - expect: The Donate panel (#Donate) becomes visible
    - expect: A Ko-fi donation link/button is visible
    - expect: The panel thanks the user

#### 2.6. should switch between menu panels correctly

**File:** `tests/specs/menu/should-switch-panels-correctly.spec.js`

**Steps:**
  1. Click SETTINGS to open Settings panel
    - expect: Settings panel is visible
  2. Click HISTORY menu item
    - expect: Settings panel is hidden
    - expect: History panel is visible
    - expect: HISTORY menu item has 'selected' class
    - expect: SETTINGS menu item does not have 'selected' class
  3. Click FEEDBACK menu item
    - expect: History panel is hidden
    - expect: Feedback panel is visible

#### 2.7. should scroll to top when switching menu panels

**File:** `tests/specs/menu/should-scroll-to-top-on-panel-switch.spec.js`

**Steps:**
  1. Open Settings panel and scroll down
    - expect: Page is scrolled down
  2. Click HISTORY menu item
    - expect: Window scrolls back to top (scrollY = 0)

### 3. Pomodoro Timer - Core Functionality

**Seed:** `tests/seed.spec.ts`

#### 3.1. should display idle timer state correctly

**File:** `tests/specs/timer/should-display-idle-state.spec.js`

**Steps:**
  1. Open popup with timer not running (fresh state), ConnectHabitica = false
    - expect: Timer display (#Time) shows '00:00'
    - expect: Pomodoro button (#PomoButton) has class 'tomatoWait'
    - expect: Pomodoro section background is light blue (#8ccff1)
    - expect: Quick settings area (#QuickSettings) is visible
    - expect: PomoStop (X) button is hidden
    - expect: SkipToBreak (>>) button is hidden
    - expect: PomoFreeze (snowflake) button is hidden
    - expect: The set counter (data-pomodoros-set attribute) shows '0/4' or configured value

#### 3.2. should start pomodoro timer when tomato button is clicked

**File:** `tests/specs/timer/should-start-timer-on-button-click.spec.js`

**Steps:**
  1. Open popup in idle state
    - expect: Timer is idle, showing tomatoWait state
  2. Click the tomato button (#PomoButton)
    - expect: Timer begins counting down from the configured pomodoro duration (default 25:00)
    - expect: Tomato button changes class to 'tomatoProgress'
    - expect: Section background changes to green
    - expect: Quick settings (#QuickSettings) hides
  3. Wait 2 seconds
    - expect: Timer display shows a value less than the starting time (e.g., 24:58)
    - expect: Timer is actively counting down

#### 3.3. should display pomodoro progress state correctly

**File:** `tests/specs/timer/should-display-progress-state.spec.js`

**Steps:**
  1. Start a pomodoro timer
    - expect: Tomato button (#PomoButton) has class 'tomatoProgress'
    - expect: Background color is green
    - expect: Timer is counting down
    - expect: The data-pomodoros attribute on #PomoButton reflects today's completed pomodoro count

#### 3.4. should show SkipToBreak button during pomodoro when enabled in settings

**File:** `tests/specs/timer/should-show-skip-to-break-when-enabled.spec.js`

**Steps:**
  1. Enable 'Skip to break button' in Settings > Timer
    - expect: showSkipToBreak setting is enabled
  2. Start a pomodoro timer
    - expect: The SkipToBreak button (#SkipToBreak) is visible
    - expect: Button displays '>>' (double right arrow) icon
  3. Click the SkipToBreak button
    - expect: Timer transitions to break state without completing the pomodoro
    - expect: Timer display shows break countdown

#### 3.5. should show Freeze button during pomodoro when enabled in settings

**File:** `tests/specs/timer/should-show-freeze-button-when-enabled.spec.js`

**Steps:**
  1. Enable 'Freeze pomodoro button (pause)' in Settings > Timer
    - expect: showFreeze setting is enabled
  2. Start a pomodoro timer
    - expect: The PomoFreeze button (#PomoFreeze) is visible with snowflake icon
  3. Click the PomoFreeze button
    - expect: Timer pauses (freezes) - display stops counting
    - expect: Tomato button changes to 'tomatoFreeze' class
    - expect: Background changes to light steel blue
    - expect: SkipToBreak and PomoFreeze buttons hide while frozen
  4. Click the tomato button to resume
    - expect: Timer resumes counting from where it paused
    - expect: Tomato button returns to 'tomatoProgress' class

#### 3.6. should transition to break state after pomodoro completes

**File:** `tests/specs/timer/should-transition-to-break-after-pomodoro.spec.js`

**Steps:**
  1. Configure a very short pomodoro duration (e.g., 0.05 minutes = 3 seconds) via quick settings
    - expect: Pomodoro duration is set to 3 seconds
  2. Click the tomato button to start the timer
    - expect: Timer starts counting down from ~3 seconds
  3. Wait for timer to reach 00:00 and complete
    - expect: Timer transitions to break state
    - expect: If ManualBreak is enabled: tomato changes to tomatoWin (green), background is green
    - expect: If ManualBreak is disabled: break starts automatically, background is cornflower blue, tomato is tomatoBreak
    - expect: PomoStop (X) button becomes visible
    - expect: Pomodoro count increments

#### 3.7. should display break state correctly

**File:** `tests/specs/timer/should-display-break-state.spec.js`

**Steps:**
  1. Transition to break state (either by completing a short pomodoro or via SkipToBreak)
    - expect: Background is cornflower blue when break timer is running
    - expect: Tomato button has 'tomatoBreak' class
    - expect: PomoStop (X) button is visible
    - expect: SkipToBreak button is hidden
    - expect: PomoFreeze button is hidden
    - expect: QuickSettings is hidden

#### 3.8. should reset timer when PomoStop (X) button is clicked during break

**File:** `tests/specs/timer/should-reset-on-pomo-stop-click.spec.js`

**Steps:**
  1. Start a pomodoro and complete it to enter break state (use short duration)
    - expect: Timer is in break state, PomoStop button is visible
  2. Click the PomoStop (X) button (#PomoStop)
    - expect: Timer resets to idle state
    - expect: Timer display shows '00:00'
    - expect: Tomato returns to 'tomatoWait' class
    - expect: Background returns to light blue
    - expect: QuickSettings becomes visible again

#### 3.9. should display break extension state correctly

**File:** `tests/specs/timer/should-display-break-extension-state.spec.js`

**Steps:**
  1. Complete a short pomodoro and let the break run past the break duration into break extension period
    - expect: Background changes to red
    - expect: Text color changes to coral
    - expect: Tomato button changes to 'tomatoWarning' class
    - expect: PomoStop (X) button is visible
    - expect: QuickSettings is hidden

#### 3.10. should trigger long break after configured number of pomodoros

**File:** `tests/specs/timer/should-trigger-long-break-after-set.spec.js`

**Steps:**
  1. Configure PomoSetNum to 2 (long break after 2 pomodoros) via Settings > Timer, and set very short durations
    - expect: Setting is saved
  2. Complete 2 short pomodoros
    - expect: After the 2nd pomodoro, a long break starts (duration = LongBreakDuration)
    - expect: Set counter resets

#### 3.11. should update set counter display during pomodoro session

**File:** `tests/specs/timer/should-update-set-counter-display.spec.js`

**Steps:**
  1. Open popup with PomoSetNum = 4
    - expect: Timer data-pomodoros-set shows '0/4'
  2. Complete 1 short pomodoro
    - expect: Set counter shows '1/4'
  3. Complete another short pomodoro
    - expect: Set counter shows '2/4'

### 4. Quick Settings

**Seed:** `tests/seed.spec.ts`

#### 4.1. should open quick settings panel when gear icon is clicked

**File:** `tests/specs/quick-settings/should-open-quick-settings.spec.js`

**Steps:**
  1. Open popup in idle state (timer not running)
    - expect: QuickSettings area (#QuickSettings) is visible in pomodoro section
  2. Click the QuickSettings area (#QuickSettings)
    - expect: The pomodoroSettings panel shows
    - expect: The pomodoro section (#pomodoro) hides
    - expect: Input fields are pre-filled: quickSet-PomoDuration, quickSet-BreakDuration, quickSet-LongBreakDuration, quickSet-PomoSetNum with current values

#### 4.2. should save quick settings and return to timer view when OK is clicked

**File:** `tests/specs/quick-settings/should-save-and-close-quick-settings.spec.js`

**Steps:**
  1. Open quick settings panel
    - expect: Quick settings panel is visible with input fields
  2. Change quickSet-PomoDuration to 30
    - expect: Input field shows 30
  3. Click the 'Ok' button (#quickSave)
    - expect: Quick settings panel hides
    - expect: Pomodoro section (#pomodoro) becomes visible
    - expect: The PomoDuration setting in main Settings is updated to 30
    - expect: Settings are persisted to storage

#### 4.3. should allow taking a manual break from quick settings

**File:** `tests/specs/quick-settings/should-take-manual-break.spec.js`

**Steps:**
  1. Open quick settings panel
    - expect: Quick settings shows 'Take X Minutes Break' option
  2. Set the break duration input (#quickSet-takeBreakDuration) to 5
    - expect: Input shows 5
  3. Click the take break button (#quickSet-takeBreak arrow)
    - expect: A manual break of 5 minutes starts
    - expect: Timer shows break countdown
    - expect: Quick settings panel closes, pomodoro section shows
    - expect: Timer display shows the manual break timer
    - expect: The set counter shows '--/--' indicating a manual break

### 5. Settings Panel - Timer Settings

**Seed:** `tests/seed.spec.ts`

#### 5.1. should display all timer setting fields with defaults

**File:** `tests/specs/settings/timer/should-display-all-timer-fields.spec.js`

**Steps:**
  1. Open popup and click SETTINGS, then verify TIMER sub-tab is active by default
    - expect: Pomodoro duration input (#PomoDuration) is visible with default value '25'
    - expect: Short Break duration input (#BreakDuration) is visible with default value '5'
    - expect: Break Extension input (#BreakExtension) is visible with default value '2'
    - expect: Long Break after input (#PomoSetNum) is visible with default value '4'
    - expect: Long Break duration input (#LongBreakDuration) is visible with default value '30'
    - expect: 'Skip to break button' checkbox (#showSkipToBreak) is unchecked by default
    - expect: 'Freeze pomodoro button' checkbox (#showFreeze) is unchecked by default
    - expect: 'Start breaks manually' checkbox (#ManualBreak) is checked by default
    - expect: 'Reset timer after break extension' checkbox (#ResetPomoAfterBreak) is unchecked by default
    - expect: Pomodoro end sound selector (#pomodoroEndSound) shows 'None' by default
    - expect: Break end sound selector (#breakEndSound) shows 'None' by default
    - expect: Ambient sound selector (#ambientSound) shows 'None' by default
    - expect: Sound volume sliders are visible with value 0.5
    - expect: Hotkey note shows 'Alt + Shift + P'

#### 5.2. should save pomodoro duration setting

**File:** `tests/specs/settings/timer/should-save-pomodoro-duration.spec.js`

**Steps:**
  1. Open Settings > Timer tab
    - expect: PomoDuration input is visible
  2. Clear the PomoDuration input and type '35'
    - expect: Input shows '35'
  3. Click the Save button
    - expect: Settings are saved to storage
    - expect: Popup reloads
    - expect: After reload, PomoDuration input shows '35'

#### 5.3. should save break duration setting

**File:** `tests/specs/settings/timer/should-save-break-duration.spec.js`

**Steps:**
  1. Open Settings > Timer and change BreakDuration to '10'
    - expect: BreakDuration input shows '10'
  2. Click Save
    - expect: Settings are saved
    - expect: After reload, BreakDuration shows '10'

#### 5.4. should enable and save skip to break option

**File:** `tests/specs/settings/timer/should-enable-skip-to-break.spec.js`

**Steps:**
  1. Open Settings > Timer and check 'Skip to break button' checkbox
    - expect: Checkbox is checked
  2. Click Save
    - expect: Setting is persisted
    - expect: After reload, 'Skip to break button' checkbox is checked
    - expect: When timer runs, SkipToBreak button (>>) is shown

#### 5.5. should allow selecting pomodoro end sound

**File:** `tests/specs/settings/timer/should-select-pomodoro-end-sound.spec.js`

**Steps:**
  1. Open Settings > Timer and locate the 'Pomodoro end sound' dropdown
    - expect: Dropdown is visible with 'None' selected
    - expect: Options include Sound1 through Sound9
  2. Select 'Sound1' from the dropdown
    - expect: Sound1 is selected
  3. Adjust the volume slider for pomodoroEndSoundVolume
    - expect: Volume level changes

#### 5.6. should allow selecting ambient sound

**File:** `tests/specs/settings/timer/should-select-ambient-sound.spec.js`

**Steps:**
  1. Open Settings > Timer, locate 'Ambient sound' dropdown
    - expect: Dropdown shows 'None', options include: Ambient Clock, Ambient Rain, Ambient Crickets, Ambient Birds
  2. Select 'Ambient Rain' from the dropdown
    - expect: Ambient Rain is selected

### 6. Settings Panel - Habitica Settings (UI only, ConnectHabitica = OFF)

**Seed:** `tests/seed.spec.ts`

**Note:** All tests in this section verify the UI behavior with `ConnectHabitica` toggled OFF. No Habitica API calls are made.

#### 6.1. should display Habitica settings panel with toggle set to OFF

**File:** `tests/specs/settings/habitica/should-display-habitica-settings-disconnected.spec.js`

**Steps:**
  1. Open Settings and click the HABITICA inner menu tab with ConnectHabitica = false
    - expect: 'Connect to Habitica' toggle (#ConnectHabitica) is visible and unchecked
    - expect: Habitica User ID input (#UID) is visible (faded, opacity 0.3)
    - expect: Habitica API Token input (#APIToken) is visible (faded, opacity 0.3)
    - expect: Link to https://habitica.com/user/settings/api is visible
    - expect: Pomodoro Habit section is visible but faded
    - expect: Pomodoro Combo Habit section is visible but faded

#### 6.2. should fade out Habitica UI elements when ConnectHabitica is OFF

**File:** `tests/specs/settings/habitica/should-fade-habitica-ui-when-disconnected.spec.js`

**Steps:**
  1. Open Settings > Habitica with ConnectHabitica = false
    - expect: All elements with class '.habitica-setting' have reduced opacity (0.3)
    - expect: Buy/cost buttons for blocked sites are hidden
    - expect: Edit buttons for blocked sites are hidden
    - expect: Footer (#Footer) is hidden

#### 6.3. should toggle ConnectHabitica ON then OFF and reflect correct UI state each time

**File:** `tests/specs/settings/habitica/should-toggle-connect-habitica.spec.js`

**Note:** This test toggles the UI only — no Habitica API call is made because no valid credentials are present.

**Steps:**
  1. Open Settings > Habitica with ConnectHabitica = false
    - expect: Habitica settings are faded (opacity 0.3)
    - expect: Footer is hidden
  2. Click the ConnectHabitica toggle to enable it (UI only — no credentials entered)
    - expect: Habitica settings elements fade to full opacity
    - expect: Footer area becomes visible
  3. Click the ConnectHabitica toggle again to disable it
    - expect: Habitica settings fade back to reduced opacity
    - expect: Footer hides again

#### 6.4. should hide the Habitica footer when ConnectHabitica is OFF

**File:** `tests/specs/settings/habitica/should-hide-footer-when-disconnected.spec.js`

**Steps:**
  1. Open popup with ConnectHabitica = false
    - expect: Footer (#Footer) is not visible
    - expect: Gold (#Dosh) and HP (#MyHp) values are not shown
    - expect: Refresh stats button (#RefreshStats) is not visible

### 7. Settings Panel - Blocker Settings

**Seed:** `tests/seed.spec.ts`

#### 7.1. should display all blocker settings options

**File:** `tests/specs/settings/blocker/should-display-blocker-settings.spec.js`

**Steps:**
  1. Open Settings and click the BLOCKER inner menu tab
    - expect: 'During break all sites are free' checkbox (#BreakFreePass) is visible
    - expect: 'Hide edit options' checkbox (#HideEdit) is visible
    - expect: 'Mute blocked websites' checkbox (#MuteBlockedSites) is visible
    - expect: 'Blocked website background transparency' checkbox (#TransparentOverlay) is visible
    - expect: Whitelist textarea (#Whitelist) is visible with placeholder text
    - expect: 'Vacation Mode' toggle (#VacationMode) is visible
    - expect: Free Pass Schedule section is visible with 'Add Free Pass Time' option
    - expect: Whitelist info note about regex support is visible

#### 7.2. should save whitelist entry for ofex.me

**File:** `tests/specs/settings/blocker/should-save-whitelist-ofex.spec.js`

**Steps:**
  1. Open Settings > Blocker and type 'ofex.me' in the Whitelist textarea (#Whitelist)
    - expect: Text appears in textarea
  2. Click Save
    - expect: Whitelist is saved to storage
    - expect: After reload, textarea contains 'ofex.me'

#### 7.3. should enable Vacation Mode and show banner

**File:** `tests/specs/settings/blocker/should-enable-vacation-mode.spec.js`

**Steps:**
  1. Open Settings > Blocker and enable Vacation Mode toggle (#VacationMode)
    - expect: VacationMode checkbox is checked
  2. Click Save
    - expect: Vacation mode is saved
    - expect: The vacation banner ('Free Pass enabled! All WebSites are free') is visible on the popup main view

#### 7.4. should add free pass time block

**File:** `tests/specs/settings/blocker/should-add-free-pass-time-block.spec.js`

**Steps:**
  1. Open Settings > Blocker and click 'Add Free Pass Time'
    - expect: A new free pass time block appears with:
    - expect: A weekday dropdown (defaulting to current day)
    - expect: A from-time input (type=time)
    - expect: A to-time input (type=time)
    - expect: A delete (trash) icon
  2. Set the day to 'Monday', from time to '09:00', to time to '10:00'
    - expect: Values are set correctly in the dropdowns/inputs
  3. Click Save
    - expect: Free pass time block is saved and persists after reload

#### 7.5. should remove free pass time block when trash icon is clicked

**File:** `tests/specs/settings/blocker/should-remove-free-pass-time-block.spec.js`

**Steps:**
  1. Add a free pass time block via 'Add Free Pass Time'
    - expect: Block is visible
  2. Click the trash icon on the free pass block
    - expect: Block fades out and is removed from the DOM
    - expect: Settings are updated automatically

#### 7.6. should enable hide edit options and hide edit controls

**File:** `tests/specs/settings/blocker/should-hide-edit-options.spec.js`

**Steps:**
  1. Block ofex.me so the site table has at least one entry
    - expect: Site table shows ofex.me with edit and delete buttons
  2. Open Settings > Blocker and enable 'Hide edit options' checkbox (#HideEdit)
    - expect: Checkbox is checked
  3. Click Save
    - expect: After reload, edit and delete buttons are hidden in the site table
    - expect: Block Site link (#BlockLink) is also hidden
    - expect: 'Hide edit options' checkbox remains checked

### 8. Site Blocker - Block & Unblock (using ofex.me)

**Seed:** `tests/seed.spec.ts`

**Note:** All site blocking tests use `ofex.me` as the target site. The whitelist feature is tested against `https://ofex.me/animation-timer/`.

#### 8.1. should show 'Block Site!' when current site (ofex.me) is not blocked

**File:** `tests/specs/site-blocker/should-show-block-site-link.spec.js`

**Steps:**
  1. Navigate to https://ofex.me/animation-timer/ in the browser
  2. Open popup
    - expect: #BlockLink shows 'Block Site!' text with a block icon
    - expect: ofex.me is not present in the #SiteTable

#### 8.2. should block ofex.me when 'Block Site!' is clicked

**File:** `tests/specs/site-blocker/should-block-site-on-click.spec.js`

**Steps:**
  1. Navigate to https://ofex.me/animation-timer/ and open popup
    - expect: BlockLink shows 'Block Site!'
  2. Click the #BlockLink
    - expect: ofex.me is added to the blocked sites table (#SiteTable) with a fade-in animation
    - expect: Site table entry shows 'ofex.me' as the hostname
    - expect: Cost/duration edit row is shown expanded for the new entry
    - expect: BlockLink text changes to 'Un-Block Site'
    - expect: Settings are saved to storage

#### 8.3. should unblock ofex.me when 'Un-Block Site' is clicked

**File:** `tests/specs/site-blocker/should-unblock-site-on-click.spec.js`

**Steps:**
  1. Block ofex.me first, then confirm it is in the table
    - expect: BlockLink shows 'Un-Block Site'
  2. Click the #BlockLink
    - expect: ofex.me entry fades out and is removed from #SiteTable
    - expect: BlockLink changes back to 'Block Site!'
    - expect: ofex.me is removed from storage

#### 8.4. should display blocked site row with duration and edit/delete controls

**File:** `tests/specs/site-blocker/should-display-blocked-site-row.spec.js`

**Steps:**
  1. Block ofex.me and open popup
    - expect: Site table (#SiteTable) contains a row for ofex.me
    - expect: Row shows hourglass icon with pass duration (default 30 minutes)
    - expect: Row shows the hostname 'ofex.me'
    - expect: Row shows an edit (pencil) button
    - expect: Row shows a delete (trash) button
    - expect: Buy button (.buy) is NOT visible (ConnectHabitica = false, gold cost irrelevant)

#### 8.5. should toggle cost/duration edit row when edit button is clicked

**File:** `tests/specs/site-blocker/should-toggle-edit-row.spec.js`

**Steps:**
  1. Block ofex.me, open popup, and click the pencil (edit) button for ofex.me
    - expect: The cost/duration input row appears below the site row
    - expect: Pass duration input is pre-filled with current duration (default 30)
    - expect: First input field is focused/selected
  2. Click the edit button again
    - expect: The cost/duration row fades out

#### 8.6. should update site pass duration when duration input is changed

**File:** `tests/specs/site-blocker/should-update-site-duration.spec.js`

**Steps:**
  1. Block ofex.me, open the edit row for ofex.me, and change the pass duration input to '60'
    - expect: Input shows '60'
  2. Press Enter to confirm
    - expect: Edit row closes
    - expect: Settings are saved
    - expect: The hourglass now shows 60 minutes

#### 8.7. should delete ofex.me when trash button is clicked

**File:** `tests/specs/site-blocker/should-delete-blocked-site.spec.js`

**Steps:**
  1. Block ofex.me, open popup, and click the delete (trash) button for ofex.me
    - expect: ofex.me row fades out and is removed from #SiteTable
    - expect: Site is removed from storage
    - expect: BlockLink changes to 'Block Site!' (since the deleted site is the current tab's site)

#### 8.8. should show blocked state for site rows during active pomodoro

**File:** `tests/specs/site-blocker/should-show-blocked-state-during-pomodoro.spec.js`

**Steps:**
  1. Block ofex.me, open popup with ofex.me in the blocked list, and start a pomodoro
    - expect: Site table rows (tbody) have 'blocked' CSS class applied
    - expect: ofex.me appears visually blocked
  2. End the pomodoro by clicking SkipToBreak (enable it first in settings) or waiting for a short duration
    - expect: Site table rows lose the 'blocked' CSS class
    - expect: ofex.me appears unblocked during break

#### 8.9. should whitelist ofex.me/animation-timer so it is not blocked

**File:** `tests/specs/site-blocker/should-whitelist-specific-path.spec.js`

**Steps:**
  1. Block ofex.me via the popup
    - expect: ofex.me appears in #SiteTable
  2. Open Settings > Blocker and add 'ofex.me/animation-timer' to the Whitelist textarea
    - expect: Text appears in textarea
  3. Click Save
    - expect: Whitelist entry is saved
  4. Navigate to https://ofex.me/animation-timer/ during an active pomodoro
    - expect: The page loads without being blocked (whitelist takes effect)
  5. Navigate to a different ofex.me page (e.g. https://ofex.me/) during an active pomodoro
    - expect: The page IS blocked (whitelist only applies to the /animation-timer path)

### 9. History Panel

**Seed:** `tests/seed.spec.ts`

#### 9.1. should display history statistics when History menu is opened

**File:** `tests/specs/history/should-display-history-statistics.spec.js`

**Steps:**
  1. Click HISTORY menu item
    - expect: History panel is visible
    - expect: Today's pomodoros count (#PomoToday) is displayed as a number in a circle
    - expect: Today's hours (#HoursToday) is displayed
    - expect: Total pomodoros (#PomoTotal) is displayed
    - expect: Total hours (#HoursTotal) is displayed
    - expect: Daily average pomodoros (#PomoAvg) is displayed
    - expect: Daily average hours (#HoursAvg) is displayed

#### 9.2. should render bar chart in History panel

**File:** `tests/specs/history/should-render-history-chart.spec.js`

**Steps:**
  1. Open History panel
    - expect: The canvas element (#HistoryChart) is rendered
    - expect: Bar chart is drawn showing recent dates
    - expect: Chart label 'Pomodoros' is shown by default
    - expect: Summary shows 'Sum: X | Avg: Y' below chart

#### 9.3. should toggle chart between Pomodoros and Hours view

**File:** `tests/specs/history/should-toggle-chart-view.spec.js`

**Steps:**
  1. Open History panel (Pomodoros chart is shown by default)
    - expect: Chart shows Pomodoros data
  2. Click 'Hours' button (#HistoryChartShowHours)
    - expect: Chart switches to showing Hours data
    - expect: Chart label changes to 'Hours'
  3. Click 'Pomodoros' button (#HistoryChartShowPomodoros)
    - expect: Chart switches back to Pomodoros view

#### 9.4. should navigate chart pages with prev/next buttons

**File:** `tests/specs/history/should-navigate-chart-pages.spec.js`

**Steps:**
  1. Open History panel
    - expect: Chart shows last 7 days of data
  2. Click the previous arrow button (#HistoryCharPrev)
    - expect: Chart moves back to show the previous 7-day window
  3. Click the next arrow button (#HistoryChartNext)
    - expect: Chart moves forward to show the next 7-day window

#### 9.5. should link to Full History page

**File:** `tests/specs/history/should-link-to-full-history.spec.js`

**Steps:**
  1. Open History panel and locate the 'Full History & Backup' link (#BackupHistogram)
    - expect: Link is visible with a full-screen icon
  2. Click the 'Full History & Backup' link
    - expect: fullHistory.html opens in a new browser tab

#### 9.6. should show data backup warning in History panel

**File:** `tests/specs/history/should-show-backup-warning.spec.js`

**Steps:**
  1. Open History panel
    - expect: A warning message (.backupDataWarning) is visible
    - expect: Warning says uninstalling will cause loss of history data
    - expect: Warning recommends backing up data

#### 9.7. should download history as JSON when Download button is clicked

**File:** `tests/specs/history/should-download-history.spec.js`

**Steps:**
  1. Open History panel and click '⇩ Download History' link (#DownloadHistogram)
    - expect: A file download is triggered
    - expect: File is named 'Histogram.json'
    - expect: File contains JSON with histogram data

#### 9.8. should clear history when Clear History button is clicked

**File:** `tests/specs/history/should-clear-history.spec.js`

**Steps:**
  1. Open History panel with some history data
    - expect: History statistics show values
  2. Click 'Clear History' button (#ClearHistogram)
    - expect: History data is cleared
    - expect: Popup reloads
    - expect: Statistics reset to 0

### 10. Edge Cases & Error States

**Seed:** `tests/seed.spec.ts`

#### 10.1. should handle invalid pomodoro duration input gracefully

**File:** `tests/specs/edge-cases/should-handle-invalid-pomo-duration.spec.js`

**Steps:**
  1. Open Settings > Timer and enter a non-numeric value (e.g., 'abc') in PomoDuration
    - expect: Input accepts the text
  2. Click Save
    - expect: The invalid value is not applied (isNaN check prevents it)
    - expect: Previous valid PomoDuration value is retained
    - expect: No crash occurs

#### 10.2. should handle invalid pass duration input gracefully

**File:** `tests/specs/edge-cases/should-handle-invalid-pass-duration.spec.js`

**Steps:**
  1. Block ofex.me, open the edit row, and enter a non-numeric value (e.g., 'abc') in the pass duration field
    - expect: Input accepts the value
  2. Press Enter to confirm
    - expect: The invalid duration is rejected or falls back to a default
    - expect: No JavaScript errors occur

#### 10.3. should handle empty blocked sites list gracefully

**File:** `tests/specs/edge-cases/should-handle-empty-blocked-sites.spec.js`

**Steps:**
  1. Open popup with BlockedSites = {} (empty) and ConnectHabitica = false
    - expect: #SiteTable is empty (no tbody rows)
    - expect: Welcome info message is displayed inside the table
    - expect: No JavaScript errors occur

#### 10.4. should handle rapid clicking of the tomato button without errors

**File:** `tests/specs/edge-cases/should-handle-rapid-tomato-clicks.spec.js`

**Steps:**
  1. Open popup and rapidly click the tomato button (#PomoButton) 5 times in quick succession
    - expect: No JavaScript errors occur
    - expect: Timer state is consistent after rapid clicks
    - expect: UI remains responsive

#### 10.5. should preserve timer state when popup is closed and reopened

**File:** `tests/specs/edge-cases/should-preserve-timer-state.spec.js`

**Steps:**
  1. Start a pomodoro timer and note the current time display
    - expect: Timer is running, e.g. showing 24:30
  2. Close the popup
    - expect: Popup closes
  3. Reopen the popup
    - expect: Timer continues from where it left off (background service worker kept it running)
    - expect: Timer display shows approximately the same or lower value, e.g., 24:15
    - expect: Timer state (tomatoProgress class, green background) is correctly restored

#### 10.6. should not show Habitica-specific UI when ConnectHabitica is OFF

**File:** `tests/specs/edge-cases/should-hide-habitica-ui-when-disconnected.spec.js`

**Steps:**
  1. Open popup with ConnectHabitica = false
    - expect: Footer (#Footer) is hidden
    - expect: Credential error alert (#CredError) is hidden
    - expect: Habitica-specific settings have reduced opacity (0.3)
    - expect: Buy buttons on blocked site rows are not visible

### 11. Site Blocker – localhost (non-real site)

**Seed:** `tests/seed.spec.ts`

**Note:** A background tab is navigated to `http://localhost/` so the extension reads `localhost` as the active tab's hostname. No real server is needed — the tab just needs to exist at that URL. These tests verify the block/unblock/delete flow produces no JavaScript errors on a non-real site.

#### 11.1. should show 'Block Site!' when localhost is not blocked

**File:** `tests/specs/site-blocker/localhost/should-show-block-site-link-for-localhost.spec.js`

**Steps:**
  1. Open a background tab navigated to `http://localhost/`, then open the popup
    - expect: #BlockLink is visible
    - expect: #BlockLink shows 'Block Site!' text

#### 11.2. should block localhost and show it in the site table without errors

**File:** `tests/specs/site-blocker/localhost/should-block-localhost.spec.js`

**Steps:**
  1. Open a background tab navigated to `http://localhost/`, then open the popup
    - expect: #BlockLink shows 'Block Site!'
  2. Click #BlockLink
    - expect: A row for `localhost` (tbody#localhost) fades into #SiteTable
    - expect: The row's hostname cell contains 'localhost'
    - expect: #BlockLink text changes to 'Un-Block Site'
    - expect: No JavaScript page errors occur
    - expect: No console error messages occur

#### 11.3. should unblock localhost via the Block Link and remove the row without errors

**File:** `tests/specs/site-blocker/localhost/should-unblock-localhost-via-link.spec.js`

**Steps:**
  1. Open a background tab to `http://localhost/`, open the popup, and block localhost
    - expect: tbody#localhost is visible in #SiteTable
    - expect: #BlockLink shows 'Un-Block Site'
  2. Click #BlockLink again to unblock
    - expect: tbody#localhost fades out and is removed from #SiteTable
    - expect: #BlockLink changes back to 'Block Site!'
    - expect: No JavaScript page errors occur
    - expect: No console error messages occur

#### 11.4. should delete localhost via the trash button and remove the row without errors

**File:** `tests/specs/site-blocker/localhost/should-delete-localhost-via-trash.spec.js`

**Steps:**
  1. Open a background tab to `http://localhost/`, open the popup, and block localhost
    - expect: tbody#localhost is visible in #SiteTable
  2. Click the delete (trash) button inside the tbody#localhost row
    - expect: tbody#localhost fades out and is removed from #SiteTable
    - expect: #BlockLink changes back to 'Block Site!'
    - expect: No JavaScript page errors occur
    - expect: No console error messages occur
