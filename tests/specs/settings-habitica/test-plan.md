# Suite 6 — Settings: Habitica Tab (UI Only, no API calls)

**Spec file:** `tests/specs/settings-habitica/settings-habitica.spec.js`

**Scope:** All Habitica-gated features are excluded from live testing. These tests only verify UI state changes driven by the ConnectHabitica toggle — no real Habitica API calls are made.

---

## 6.1 Habitica tab with toggle OFF → all .habitica-setting elements faded (opacity < 0.5), footer hidden

**Steps:**
1. Open Settings panel, click the Habitica tab label (`[data-testid='inner-menu-habitica']`) to switch to the Habitica tab
2. If `[data-testid='connect-habitica']` is checked, click its label to toggle it OFF
   - expect: `[data-testid='connect-habitica']` toggle is unchecked
   - expect: All elements with CSS class `habitica-setting` have computed opacity < 0.5 (poll up to 5 s)
   - expect: `[data-testid='uid']` input is visible (but faded)
   - expect: `[data-testid='api-token']` input is visible (but faded)
   - expect: `[data-testid='footer']` is not visible

---

## 6.2 toggle ConnectHabitica ON → habitica-setting elements restore full opacity; toggle OFF again → elements fade back

**Steps:**
1. Open Settings > Habitica tab; if toggle is OFF, click label to toggle ON
   - expect: All elements with CSS class `habitica-setting` have computed opacity > 0.99 (poll up to 5 s)
2. Click the toggle label to set ConnectHabitica OFF
   - expect: All elements with CSS class `habitica-setting` return to computed opacity < 0.5 (poll up to 5 s)
