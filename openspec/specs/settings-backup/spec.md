# settings-backup Specification

## Purpose

Allow users to export the full extension configuration (gesture→operation mappings and line settings) to a versioned
JSON file and import such a file back, with all-or-nothing validation and replace-all semantics.

## Requirements

### Requirement: Backup tab

The popup SHALL provide a third tab named "Backup", alongside the existing Gestures and Settings tabs, hosting the
Export and Import actions.

#### Scenario: Switching to the Backup tab

- **WHEN** the user clicks the Backup tab header
- **THEN** the Backup tab becomes active and shows the Export and Import buttons

### Requirement: Export configuration to a file

The popup Backup tab SHALL provide an Export action that downloads a JSON file containing the format version, all stored
gesture→operation mappings in storage form, and the stored line settings. The exported values MUST come from
`chrome.storage.local`, not from unsaved UI input state.

#### Scenario: Successful export

- **WHEN** the user clicks Export in the Backup tab
- **THEN** a file named `simple-mouse-gestures-backup.json` is downloaded containing `version: 1`, the full stored
  gesture map, and the stored `lineColor` and `lineWidth`

#### Scenario: Unsaved UI changes are not exported

- **WHEN** the user changes the line color input in the Settings tab without clicking Save and then clicks Export in the
  Backup tab
- **THEN** the downloaded file contains the line color currently persisted in storage, not the unsaved input value

### Requirement: Import replaces all configuration

The popup Backup tab SHALL provide an Import action that reads a user-selected JSON backup file and, after the user
confirms a replacement warning, replaces all stored gesture mappings and line settings with the file contents. After a
confirmed import the popup MUST notify the service worker to reload its cached state and MUST refresh the visible
gesture list and settings inputs.

#### Scenario: Successful import

- **WHEN** the user selects a valid backup file and confirms the replacement warning
- **THEN** both storage keys are overwritten with the file contents, the service worker receives an `updateStorage`
  message, and the popup's gesture list and settings inputs show the imported values

#### Scenario: User cancels the confirmation

- **WHEN** the user selects a valid backup file but dismisses the replacement warning
- **THEN** storage is not modified and the popup UI remains unchanged

### Requirement: Import rejects invalid files entirely

Import SHALL validate the entire file before applying anything and SHALL reject the whole file with a descriptive
message when any check fails; storage MUST remain unmodified after a rejected import. Validation MUST cover: JSON
parseability, format version equal to `1`, gesture keys being 1–8 pipe-joined tokens from `up`/`right`/`down`/`left`
with no two consecutive tokens equal, operation values existing in the current operation registry, `lineColor` being a
`#rrggbb` hex color, and `lineWidth` being an integer between 1 and 10 (number or numeric string).

#### Scenario: Malformed JSON

- **WHEN** the user selects a file that is not valid JSON
- **THEN** an error message is shown and storage is not modified

#### Scenario: Unsupported format version

- **WHEN** the user selects a JSON file whose `version` is not `1`
- **THEN** an error message naming the unsupported version is shown and storage is not modified

#### Scenario: Invalid gesture key

- **WHEN** the user selects a file containing a gesture key with an unknown token, more than 8 tokens, or two equal
  consecutive tokens
- **THEN** an error message naming the invalid gesture is shown and storage is not modified

#### Scenario: Unknown operation

- **WHEN** the user selects a file mapping a gesture to an operation key that does not exist in this version's operation
  registry
- **THEN** an error message naming the unknown operation is shown and storage is not modified

#### Scenario: Invalid line settings

- **WHEN** the user selects a file whose `lineColor` is not a `#rrggbb` hex color or whose `lineWidth` is not an integer
  between 1 and 10
- **THEN** an error message naming the invalid setting is shown and storage is not modified
