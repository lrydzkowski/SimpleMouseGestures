# Polish Popup to Match Chrome UI

## Why

The popup currently looks homemade — black 1px borders, file-folder tabs, dashed separators, and blocking `alert()`
dialogs — which clashes with the Chrome UI it lives inside. Restyling it after Chrome's current design language (the
2023 GM3 refresh) makes the extension feel native and trustworthy, and fixing the interaction layer (keyboard
activation, inline validation, auto-saving settings) brings its behavior in line with Chrome settings pages.

## What Changes

- Restyle the entire popup with a GM3-inspired design token set: text-only tabs with a blue underline indicator,
  pill-shaped buttons (filled primary, outlined secondary), hairline dividers, GM3 blue `#0b57d0`, system font stack,
  visible focus rings. Light mode only.
- Rework gesture list rows: content first (gesture code as a chip, operation label as text), destructive action as a
  trailing icon button on the right. Fix the `Event:` label to say `Operation`.
- Replace `alert()` validation messages on the Gestures tab with inline error text under the gesture input.
- Replace the import `confirm()` with a GM3-styled modal dialog; show import errors and the import success message as an
  inline message area on the Backup tab instead of `alert()`.
- The Settings tab auto-saves on change — the Save button is removed. A persistent caption explains that changes apply
  to newly loaded pages.
- Keyboard accessibility: tab headers become real `<button>` elements, all `mousedown` handlers on buttons become
  `click` handlers so Enter/Space work.
- Theme the vendored Coloris color picker by overriding its public CSS classes (`.clr-picker`, `.clr-field`, …) from
  `popup.css`, without touching vendored files (the vendored build exposes no CSS custom properties).

## Capabilities

### New Capabilities

- `popup-chrome-ui`: The popup's Chrome-consistent visual system and interaction patterns — tab navigation, button and
  form-control styling, gesture list presentation, inline validation, modal confirmation dialog, and keyboard
  accessibility.
- `line-settings`: The Settings tab behavior — configuring gesture line color and width with immediate persistence
  (auto-save) and user-visible guidance that changes apply to newly loaded pages.

### Modified Capabilities

- `settings-backup`: The "Unsaved UI changes are not exported" scenario becomes obsolete — with auto-save there is no
  unsaved settings input state. The export requirement is reworded to reflect that settings are always persisted
  immediately; export still reads from `chrome.storage.local`.

## Impact

- `popup/popup.html` — restructured markup: tab buttons, add-form layout, settings captions, dialog element, inline
  message containers; Save button removed.
- `popup/popup.css` — rewritten around a design token set (CSS custom properties); Coloris variable overrides.
- `popup/popup-handler.js` — `click` handlers, inline validation rendering, dialog-based import confirmation, inline
  backup messages, settings auto-save wiring, row rendering changes.
- `popup/storage.js`, service worker, content scripts — no changes; `saveSettingsAsync` already notifies the service
  worker per save.
- Chrome Web Store screenshots in `images/` that show the popup will be stale after this change; regenerating them is a
  release activity outside this change.
