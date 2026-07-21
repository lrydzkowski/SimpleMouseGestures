# Tasks: Polish Popup to Match Chrome UI

## 1. Design tokens and base styles

- [x] 1.1 Define the GM3 token set (`:root` custom properties from design.md) in `popup.css` and switch the font stack
      to `system-ui, sans-serif` at 13px base
- [x] 1.2 Restyle base controls from tokens: text inputs and selects (outline border, `--radius-small`, height), shared
      button styles as pills (filled primary and outlined secondary variants, 32px height, `color-mix()` state layers)
- [x] 1.3 Add a global `:focus-visible` style (2px primary outline, 2px offset) for all interactive elements

## 2. Tab navigation

- [x] 2.1 Convert `.header` divs in `popup.html` to `button` elements with `role="tab"`/`aria-selected`, wrap in
      `role="tablist"`, and add `role="tabpanel"` to tab containers
- [x] 2.2 Restyle tabs: plain text labels, rounded 3px blue underline indicator on the active tab, hairline divider
      replacing `.separator`'s black line
- [x] 2.3 Switch tab activation in `popup-handler.js` from `mousedown` to `click` and update `aria-selected` on switch

## 3. Gestures tab

- [x] 3.1 Restyle the add row: labeled gesture input and operation select, filled pill Add button
- [x] 3.2 Rework `#createRow` to render gesture chip → operation label → trailing SVG trash icon button (no `Event:`
      prefix), and restyle rows to 40px with hairline dividers
- [x] 3.3 Add the inline validation error element below the add row (`aria-live="polite"`), rewire
      `#showValidationError` to render into it and focus the input, and clear it on gesture-input keydown and on
      successful add
- [x] 3.4 Convert Add and delete button handlers from `mousedown` to `click` and drop the `Consts.leftButton` guards

## 4. Settings tab auto-save

- [x] 4.1 Remove the Save button from `popup.html` and `#registerSaveSettingsButtonEvent` from `popup-handler.js`
- [x] 4.2 Save settings on `change` of `#line-width` and `#line-color`, verifying Coloris commits values via the
      `change` event and that the restore-time `input` dispatch does not trigger a save
- [x] 4.3 Add the persistent caption (secondary text) stating changes save automatically and apply to newly loaded pages
- [x] 4.4 Restyle the Settings tab rows and controls with the token set

## 5. Backup tab

- [x] 5.1 Add the `dialog` element for import confirmation to `popup.html` (title, body, Cancel/Replace text buttons,
      `--radius-dialog`) and implement a promise-based `#confirmReplaceAsync()` using `showModal()`, treating Esc/cancel
      as false
- [x] 5.2 Add the inline message area to the Backup tab with error and success variants (`aria-live="polite"`), route
      import validation errors and the import success message into it, and clear it when a new import or export starts
- [x] 5.3 Replace the `confirm()` call in `#importBackupAsync` with `#confirmReplaceAsync()` and remove the
      `alert()`-based `#showMessage` once no callers remain
- [x] 5.4 Convert Export/Import button handlers from `mousedown` to `click` and restyle both as outlined pills

## 6. Coloris theming and polish

- [x] 6.1 Override Coloris public classes (`.clr-field`, `.clr-picker`, …) from `popup.css` to match the token set
      (radii, borders, shadow), leaving vendored files untouched
- [x] 6.2 Run `npx prettier --write .` and verify no vendored files changed

## 7. Verification

- [x] 7.1 Load the unpacked extension and verify every spec scenario manually: tab switching (mouse and keyboard),
      add/delete gestures with inline validation, settings auto-save persistence across popup reopen, export reflecting
      auto-saved settings, import dialog confirm/cancel/Esc, inline backup messages
- [x] 7.2 Verify keyboard-only operation end to end (Tab focus order, visible focus rings, Enter/Space activation) and
      that no `alert()`/`confirm()` calls remain in `popup/`
