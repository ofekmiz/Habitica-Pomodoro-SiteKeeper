# Suite 7 — Settings: Blocker Tab (offline-only features)

**Spec file:** `tests/specs/settings-blocker/settings-blocker.spec.js`

---

## 7.1 Blocker tab displays: hide-edit label, mute-blocked-sites label, transparent-overlay label, whitelist textarea; Habitica-gated fields present in DOM

**Steps:**
1. Open Settings panel, click `[data-testid='inner-menu-blocker']` label to switch to Blocker tab
   - expect: Hide-edit label (for `[data-testid='hide-edit']`) is visible
   - expect: Mute-blocked-sites label (for `[data-testid='mute-blocked-sites']`) is visible
   - expect: Transparent-overlay label (for `[data-testid='transparent-overlay']`) is visible
   - expect: `[data-testid='whitelist']` textarea is visible
   - expect: `[data-testid='vacation-mode']`, `[data-testid='break-free-pass']`, and `[data-testid='free-pass-blocks']` are **attached** to the DOM (have `habitica-setting` class — not tested functionally)

---

## 7.2 save whitelist entry: type 'ofex.me/animation-timer', save, reload, verify persisted

**Steps:**
1. Open Settings > Blocker tab, fill `[data-testid='whitelist']` textarea with `'ofex.me/animation-timer'`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Reload the popup, reopen Settings > Blocker tab
   - expect: `[data-testid='whitelist']` textarea value matches `ofex.me/animation-timer`

**Cleanup:** Clear the whitelist textarea and save.

---

## 7.3 enable hide-edit option with a blocked site → edit/delete buttons and block-link hide after save

**Fixture:** `popupPageWithOfexBlocked` — opens a fresh popup with `ofex.me` pre-blocked in storage.

**Steps:**
1. Open Settings > Blocker tab, enable `[data-testid='hide-edit']`, click `[data-testid='save-button']`
   - expect: Settings saved
2. Close Settings panel
   - expect: Edit (pencil) button for the `ofex.me` row is not visible
   - expect: Delete (trash) button for the `ofex.me` row is not visible
   - expect: `[data-testid='block-link']` is not visible

**Cleanup:** Reopen Settings > Blocker tab, disable `hide-edit`, save.
