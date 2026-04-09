# Suite 1 — Popup Initial Load & UI Elements

**Spec file:** `tests/specs/popup-ui/popup-ui.spec.js`

## Application context

The popup (`popup/popup.html`) is the primary UI. These tests verify the initial DOM state on open: visible sections, timer display, button classes, footer visibility, and the new-window button.

---

## 1.1 should display main container with all top-level UI sections visible; footer visible (default state)

**Steps:**
1. Open the extension popup (navigate to `popup/popup.html`) with default storage (ConnectHabitica = ON by default)
   - expect: `[data-testid='main-container']` is visible
   - expect: `[data-testid='menu-container']` is visible
   - expect: `[data-testid='pomodoro-section']` is visible
   - expect: `[data-testid='timer-display']` shows `'00:00'`
   - expect: `[data-testid='pomo-button']` is visible with class `tomatoWait`
   - expect: `[data-testid='block-link']` is visible
   - expect: `[data-testid='site-table']` is present in the DOM (attached)
   - expect: `[data-testid='footer']` **IS visible** (ConnectHabitica ON)

---

## 1.2 should display main container with all top-level UI sections visible; footer NOT visible

**Steps:**
1. Open the popup, open Settings > Habitica tab, toggle ConnectHabitica OFF, close Settings panel
   - expect: `[data-testid='main-container']` is visible
   - expect: `[data-testid='menu-container']` is visible
   - expect: `[data-testid='pomodoro-section']` is visible
   - expect: `[data-testid='timer-display']` shows `'00:00'`
   - expect: `[data-testid='pomo-button']` is visible with class `tomatoWait`
   - expect: `[data-testid='block-link']` is visible
   - expect: `[data-testid='site-table']` is present in the DOM (attached)
   - expect: `[data-testid='footer']` is **NOT visible** (ConnectHabitica OFF)

---

## 1.3 should show welcome info when no sites are blocked; block-link shows 'Block Site!'

**Steps:**
1. Open the popup with no blocked sites in storage
   - expect: `[data-testid='welcome-info']` is visible inside `[data-testid='site-table']`
   - expect: The welcome message text contains `'block site'` (case-insensitive)
   - expect: `[data-testid='block-link']` shows the text `'Block Site!'`

---

## 1.4 should NOT show save button on initial load (no panel open)

**Steps:**
1. Open the popup without clicking any menu item
   - expect: `[data-testid='save-button']` is not visible
   - expect: `[data-testid='settings-panel']` is hidden
   - expect: `[data-testid='history-panel']` is hidden
   - expect: `[data-testid='feedback-panel']` is hidden
   - expect: `[data-testid='donate-panel']` is hidden

---

## 1.5 should display open-in-new-window button and open new window on click

**Steps:**
1. Open the popup and locate `[data-testid='popup-new-window']`
   - expect: `[data-testid='popup-new-window']` is visible inside `[data-testid='pomodoro-section']`
2. Click `[data-testid='popup-new-window']`
   - expect: A new browser window/tab opens with a URL matching `popup.html`
