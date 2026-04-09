# Suite 2 — Menu Navigation

**Spec file:** `tests/specs/menu/menu.spec.js`

---

## 2.1 should open Settings panel on SETTINGS click; Timer sub-tab active by default; save button appears

**Steps:**
1. Verify `[data-testid='settings-panel']` is hidden
   - expect: `[data-testid='settings-panel']` is hidden
2. Click `[data-testid='menu-settings-trigger']`
   - expect: `[data-testid='settings-panel']` becomes visible
   - expect: `[data-testid='save-button']` is visible
   - expect: The Timer sub-tab content is displayed by default (`[data-testid='pomo-duration']` field is visible)

---

## 2.2 should close Settings panel on second SETTINGS click; save button hides

**Steps:**
1. Click `[data-testid='menu-settings-trigger']` to open the Settings panel
   - expect: `[data-testid='settings-panel']` is visible
   - expect: `[data-testid='save-button']` is visible
2. Click `[data-testid='menu-settings-trigger']` again to toggle it closed
   - expect: `[data-testid='settings-panel']` is hidden
   - expect: `[data-testid='save-button']` is hidden

---

## 2.3 should open History panel on HISTORY click

**Steps:**
1. Click `[data-testid='menu-history-trigger']`
   - expect: `[data-testid='history-panel']` becomes visible
   - expect: `[data-testid='pomo-today']` is visible
   - expect: `[data-testid='hours-today']` is visible
   - expect: `[data-testid='history-chart']` element is visible

---

## 2.4 should open Feedback panel with all links visible

**Steps:**
1. Click `[data-testid='menu-feedback-trigger']`
   - expect: `[data-testid='feedback-panel']` becomes visible
   - expect: `[data-testid='rate-and-review-link']` is visible
   - expect: A bug report / feature request link (href containing `github`, `bug`, or `feature`) is visible
   - expect: A Wiki page link (href containing `wiki`) is visible
   - expect: An anchor with text matching `/pomodoro/i` is visible

---

## 2.5 should open Donate panel with Ko-fi link visible

**Steps:**
1. Click `[data-testid='menu-donate-trigger']`
   - expect: `[data-testid='donate-panel']` becomes visible
   - expect: An anchor with `href` containing `ko-fi` is visible inside the donate panel

---

## 2.6 should switch between panels: Settings → History → Feedback; each previous panel hides

**Steps:**
1. Click `[data-testid='menu-settings-trigger']`
   - expect: `[data-testid='settings-panel']` is visible
   - expect: `[data-testid='history-panel']` is hidden
2. Click `[data-testid='menu-history-trigger']`
   - expect: `[data-testid='history-panel']` is visible
   - expect: `[data-testid='settings-panel']` is hidden
3. Click `[data-testid='menu-feedback-trigger']`
   - expect: `[data-testid='feedback-panel']` is visible
   - expect: `[data-testid='history-panel']` is hidden
