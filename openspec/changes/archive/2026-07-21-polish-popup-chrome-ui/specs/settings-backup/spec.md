# settings-backup Delta Specification

## MODIFIED Requirements

### Requirement: Export configuration to a file

The popup Backup tab SHALL provide an Export action that downloads a JSON file containing the format version, all stored
gesture→operation mappings in storage form, and the stored line settings. The exported values MUST come from
`chrome.storage.local`, which is the single source of truth now that line settings persist automatically on change.

#### Scenario: Successful export

- **WHEN** the user clicks Export in the Backup tab
- **THEN** a file named `simple-mouse-gestures-backup.json` is downloaded containing `version: 1`, the full stored
  gesture map, and the stored `lineColor` and `lineWidth`

#### Scenario: Export reflects auto-saved settings

- **WHEN** the user changes the line color in the Settings tab (the picker commits the value) and then clicks Export in
  the Backup tab
- **THEN** the downloaded file contains the newly committed line color, because it was persisted automatically on change
