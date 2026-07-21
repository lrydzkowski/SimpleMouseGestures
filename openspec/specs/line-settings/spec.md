# line-settings Specification

## Purpose

Let users configure the gesture trail's appearance (line color and width) from the popup Settings tab, persisting
changes automatically without an explicit save action.

## Requirements

### Requirement: Line appearance configuration

The Settings tab SHALL let the user configure the gesture trail's line color via a color picker producing a `#rrggbb`
hex value and the line width via a select offering integer widths from 1 to 10 pixels. Opening the popup MUST show the
currently stored values in both controls.

#### Scenario: Stored values shown on open

- **WHEN** the user opens the popup and switches to the Settings tab
- **THEN** the color control shows the stored `lineColor` and the width select shows the stored `lineWidth`

### Requirement: Settings auto-save on change

Line settings SHALL persist to `chrome.storage.local` immediately when a control's value changes — width on select
change, color when the picker commits a value — without any explicit save action; the Settings tab MUST NOT contain a
Save button. Each save MUST notify the service worker to reload its cached state. Restoring stored values into the
controls when the popup opens MUST NOT trigger a save.

#### Scenario: Changing line width persists immediately

- **WHEN** the user selects a different line width
- **THEN** the new width is persisted to storage and the service worker receives an `updateStorage` message, with no
  save action required

#### Scenario: Committing a line color persists immediately

- **WHEN** the user picks a new color and the picker commits the value
- **THEN** the new color is persisted to storage and the service worker receives an `updateStorage` message

#### Scenario: Reopening the popup shows auto-saved values

- **WHEN** the user changes a line setting, closes the popup, and reopens it
- **THEN** the Settings tab shows the changed value

#### Scenario: Restoring values does not save

- **WHEN** the popup opens and stored values are loaded into the Settings controls
- **THEN** no save is triggered by the restore itself

### Requirement: Reload guidance caption

The Settings tab SHALL display a persistent caption in secondary text stating that changes are saved automatically and
apply to pages loaded after the change.

#### Scenario: Caption is always visible

- **WHEN** the user views the Settings tab
- **THEN** the caption about automatic saving and page reload is visible without any prior interaction
