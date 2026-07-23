# Proposal: gesture-input-filter-and-help

## Why

The gesture input accepts any characters and only reports problems after the user clicks Add, and the Gestures tab
offers no explanation of how gestures work — the direction letters, the arrow-key shortcut, and the fact that changing a
mapping requires deleting and re-adding it are all undiscoverable. Filtering obviously invalid input at typing time and
adding an in-popup help dialog makes the tab self-explanatory.

## What Changes

- The gesture input rejects non-letter characters at input time: digits, spaces, and symbols are stripped as they are
  typed, pasted, or dropped, so only letters A–Z can appear in the field.
- The gesture input displays its content in uppercase via CSS `text-transform: uppercase`; the existing Add-time
  uppercasing keeps stored values uppercase regardless of typed case.
- Add-time validation is unchanged: wrong letters (anything outside U/R/D/L), consecutive repeats, length, and
  duplicates still produce the existing inline error messages.
- A help icon button is added to the Gestures tab that opens a modal help dialog explaining how to add, modify, and
  delete gestures — including the honest workaround that modifying a mapping means deleting the row and adding it again
  — plus the direction letters, the arrow-key input shortcut, and the gesture rules.
- The help dialog is an HTML `dialog` element visually consistent with the existing import confirmation dialog (same
  rounded-corner, shadow, backdrop, and typography styles).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `popup-chrome-ui`: adds two requirements — gesture input character filtering with uppercase display, and an in-popup
  help dialog on the Gestures tab. Existing requirements (inline validation, import confirmation dialog) are unchanged.

## Impact

- `src/entrypoints/popup/index.html`: help icon button in the gestures add row, new help `dialog` element.
- `src/entrypoints/popup/popup-handler.ts`: input-event sanitization for the gesture field, help button event
  registration and dialog opening.
- `src/entrypoints/popup/style.css`: `text-transform: uppercase` on the gesture input; minor help dialog content styles
  if needed (element-level `dialog` styles already apply).
- `tests/`: new test coverage for the gesture input sanitization behavior (Vitest, happy-dom).
- No changes to storage, messages, content scripts, service worker, or the manifest.
