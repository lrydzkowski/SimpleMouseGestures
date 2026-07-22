# unit-tests Specification (delta)

## ADDED Requirements

### Requirement: Test suite runs via npm

The project SHALL provide an `npm test` script that runs the Vitest suite once (non-watch) and exits non-zero when any
test fails.

#### Scenario: Passing suite

- **WHEN** a developer runs `npm test` on a healthy tree
- **THEN** all tests pass and the process exits with code 0

#### Scenario: Failing test breaks the run

- **WHEN** any test assertion fails
- **THEN** `npm test` exits with a non-zero code and reports the failing test

### Requirement: Gesture tokenization is covered

Unit tests SHALL cover `GesturesHandler` black-box through its event-driven surface (`initPosition`, synthetic
`mousemove` events with the right button held, `getGestures`), including: mapping movement angles to
`up`/`right`/`down`/`left` across all four direction boundaries, deduplication of consecutive identical directions,
ignoring movements of 3px or less on both axes, and ignoring events where the right button is not held.

#### Scenario: Direction boundaries

- **WHEN** synthetic right-button mouse movements cross each angle sector (up, right, down, left)
- **THEN** `getGestures()` returns the corresponding direction tokens

#### Scenario: Consecutive duplicates collapse

- **WHEN** several consecutive movements resolve to the same direction
- **THEN** the direction appears once in the recorded gesture sequence

#### Scenario: Small movements are ignored

- **WHEN** a movement changes both coordinates by 3px or less
- **THEN** no gesture token is recorded for it

#### Scenario: Non-right-button movement is ignored

- **WHEN** a `mousemove` event without the right button held is dispatched during recording
- **THEN** it contributes no gesture token

### Requirement: Gesture serialization is covered

Unit tests SHALL cover `GesturesSerializer` conversion between the UI letter form (e.g. `UL`) and the storage form (e.g.
`up|left`) in both directions.

#### Scenario: Round trip

- **WHEN** a letter sequence is serialized to storage form and deserialized back
- **THEN** the original letter sequence is recovered

### Requirement: Operation resolution is covered

Unit tests SHALL cover `OperationResolver`: resolving a stored gesture sequence to its mapped operation and handling a
gesture sequence with no mapping.

#### Scenario: Known mapping resolves

- **WHEN** a gesture sequence whose pipe-joined key exists in the stored map is resolved
- **THEN** the mapped operation is selected for execution

#### Scenario: Unknown mapping is a no-op

- **WHEN** a gesture sequence with no stored mapping is resolved
- **THEN** no operation is executed and no error is thrown

### Requirement: Backup validation is covered

Unit tests SHALL cover `BackupHandler` with an injected fake storage: export file content (version, gestures, settings)
and rejection of invalid imports — wrong or missing format version, invalid gesture token sequences, unknown operation
keys, invalid line color, and out-of-range line width.

#### Scenario: Export content

- **WHEN** an export is built from fake storage containing known gestures and settings
- **THEN** the produced JSON contains the format version, the full gesture map, and the settings

#### Scenario: Invalid import is rejected

- **WHEN** an import file violates any validation rule (version, gestures, operation keys, color, width)
- **THEN** the import is rejected and no storage write occurs
