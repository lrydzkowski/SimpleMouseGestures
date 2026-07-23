# popup-chrome-ui Specification

## Purpose

Define the popup's visual and interaction chrome: a GM3-modeled design token system, keyboard-accessible controls,
inline validation and messaging instead of blocking dialogs, gesture list row presentation, and an in-popup import
confirmation dialog.

## Requirements

### Requirement: GM3 visual system

The popup SHALL style all UI from a single design token set (CSS custom properties) modeled on Chrome's GM3 refresh,
light mode: primary blue `#0b57d0`, hairline dividers, pill-shaped buttons (filled primary, outlined secondary), rounded
inputs and selects, and the `system-ui` font stack at 13px base size.

#### Scenario: Buttons render in GM3 styles

- **WHEN** the popup opens
- **THEN** the Add button renders as a filled blue pill, and the Export and Import buttons render as outlined pills with
  blue text

#### Scenario: Tabs render with underline indicator

- **WHEN** the popup opens
- **THEN** tab headers render as plain text labels above a hairline divider, with the active tab marked by a rounded
  blue underline indicator and no boxed borders

### Requirement: Keyboard-accessible controls

All interactive elements in the popup SHALL be focusable and operable with the keyboard: tab headers MUST be `button`
elements, all action buttons MUST activate on `click` (which includes Enter/Space on a focused button), and focused
elements MUST show a visible focus indicator.

#### Scenario: Switching tabs with the keyboard

- **WHEN** the user focuses the Settings tab header with the Tab key and presses Enter
- **THEN** the Settings tab becomes active and its panel is shown

#### Scenario: Activating a button with the keyboard

- **WHEN** the user focuses the Add button and presses Enter
- **THEN** the add action runs exactly as if the button had been clicked

#### Scenario: Focus is visible

- **WHEN** the user moves focus through the popup with the Tab key
- **THEN** each focused element shows a visible focus ring

### Requirement: Inline gesture validation

Gesture validation failures on the Gestures tab SHALL be shown as inline error text below the add row, styled in the
error color, instead of a blocking dialog. The gesture input MUST receive focus when an error is shown, and the error
MUST be cleared on the next gesture input keystroke or on a successful add.

#### Scenario: Invalid gesture shows inline error

- **WHEN** the user tries to add a gesture containing a disallowed character
- **THEN** an inline error message naming the disallowed character appears below the add row, the gesture input is
  focused, and no blocking dialog is shown

#### Scenario: Error clears on next input

- **WHEN** an inline validation error is visible and the user types in the gesture input
- **THEN** the error message is removed

### Requirement: Gesture list row presentation

Each gesture list row SHALL show, in order: the gesture code in a small rounded chip, the mapped operation label as
plain text, and a trailing delete icon button aligned to the right edge. Rows MUST be separated by hairline dividers.
Deleting via the icon button MUST remove the mapping from storage and the row from the list, as before.

#### Scenario: Row layout

- **WHEN** a stored gesture mapping is rendered in the list
- **THEN** the row shows the gesture code chip first, the operation label next, and a delete icon button at the right
  edge, with no "Event:" text

#### Scenario: Deleting a row via the icon button

- **WHEN** the user clicks the delete icon button on a row
- **THEN** the mapping is removed from storage and the row disappears from the list

### Requirement: In-popup import confirmation dialog

The import replacement warning SHALL be presented as a modal dialog rendered inside the popup (HTML `dialog` element)
with a title, explanatory text, and Cancel and Replace actions, instead of the browser-native `confirm()` dialog.
Pressing Escape or choosing Cancel MUST cancel the import.

#### Scenario: Confirming the dialog proceeds with import

- **WHEN** the user selects a valid backup file and activates Replace in the dialog
- **THEN** the import proceeds

#### Scenario: Escape cancels the dialog

- **WHEN** the confirmation dialog is open and the user presses Escape
- **THEN** the dialog closes and storage is not modified

### Requirement: Backup tab inline messages

Import errors and the post-import success message SHALL be shown in a persistent inline message area on the Backup tab,
with an error variant styled in the error color, instead of blocking dialogs. The message area MUST be cleared when a
new import or export is started.

#### Scenario: Invalid backup file shows inline error

- **WHEN** the user selects a backup file that fails validation
- **THEN** the validation message appears in the Backup tab message area styled as an error, and no blocking dialog is
  shown

#### Scenario: Successful import shows inline confirmation

- **WHEN** an import completes successfully
- **THEN** the message area shows a confirmation that settings were imported and that already-open pages need a reload

### Requirement: Gesture input character filtering

The gesture input SHALL accept only letters (A–Z, case-insensitive): any other character MUST be removed at input time,
whether typed, pasted, or dropped, and the caret position MUST be preserved when characters are removed. The field SHALL
display its content in uppercase regardless of the typed case. Add-time validation and normalization are unchanged:
values are uppercased before validation, and wrong letters (outside U/R/D/L), consecutive repeats, length, and
duplicates still produce the existing inline errors.

#### Scenario: Non-letter characters are rejected at input time

- **WHEN** the user types `1`, `-`, or a space into the gesture input
- **THEN** the character does not appear in the field

#### Scenario: Pasted content is filtered to letters

- **WHEN** the user pastes `u1r-2d` into the gesture input
- **THEN** the field contains only the letters `urd`, displayed as `URD`

#### Scenario: Lowercase letters display and store as uppercase

- **WHEN** the user types `ul` into the gesture input and clicks Add
- **THEN** the field displays `UL` while typing, and the gesture is stored as the uppercase form

#### Scenario: Wrong letters still reach Add-time validation

- **WHEN** the user types `X` into the gesture input and clicks Add
- **THEN** the letter appears in the field and the existing inline error naming the disallowed character is shown

### Requirement: Gestures help dialog

The Gestures tab SHALL provide a help icon button with an accessible label that opens a modal help dialog (HTML `dialog`
element). The dialog MUST explain how to add a gesture (direction letters U/R/D/L, the arrow-key entry shortcut,
choosing an operation), how to modify a mapping — explicitly stating that modifying requires deleting the row and adding
the gesture again — and how to delete a mapping, plus the gesture rules (maximum 8 moves, no repeated consecutive
moves). The dialog MUST be visually consistent with the import confirmation dialog by sharing its dialog frame,
backdrop, and typography styles, and MUST close via its Close button or the Escape key without changing any state.

#### Scenario: Opening the help dialog

- **WHEN** the user activates the help icon button on the Gestures tab
- **THEN** a modal dialog opens explaining how to add, modify, and delete gestures, including that modifying a mapping
  means deleting it and adding it again

#### Scenario: Closing the help dialog

- **WHEN** the help dialog is open and the user presses Escape or activates Close
- **THEN** the dialog closes and gestures and settings are unchanged

#### Scenario: Help dialog matches the import dialog styling

- **WHEN** the help dialog opens
- **THEN** it renders with the same dialog frame, backdrop, and typography styles as the import confirmation dialog
