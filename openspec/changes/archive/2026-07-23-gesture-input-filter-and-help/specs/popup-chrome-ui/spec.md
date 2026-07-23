# popup-chrome-ui Delta Specification

## ADDED Requirements

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
