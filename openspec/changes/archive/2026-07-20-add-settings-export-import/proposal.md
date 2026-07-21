# Proposal: Add Settings Export / Import

## Why

All extension state (gesture→operation mappings and line settings) lives only in `chrome.storage.local`, so users have
no way to back it up, restore it after a reinstall, or move it to another machine. A file-based export/import in the
popup solves this without any new permissions.

## What Changes

- Add a new "Backup" tab to the popup (next to Gestures and Settings) with two buttons: Export and Import.
- Export downloads a single versioned JSON file containing both storage keys: the gesture→operation map
  (`simpleMouseGesturesData`) and the line settings (`simpleMouseGesturesSettings`), read from storage (not from unsaved
  UI state).
- Import reads a user-selected JSON file, validates it fully, and — after user confirmation — replaces all stored
  gestures and settings with the file contents, notifies the service worker, and refreshes the popup UI.
- Validation rejects the whole file on any error (unknown format version, malformed structure, invalid gesture keys,
  unknown operation keys, invalid line color or width); nothing is applied partially.

## Capabilities

### New Capabilities

- `settings-backup`: Exporting the full extension configuration (gesture mappings + line settings) to a JSON file and
  importing such a file back, with all-or-nothing validation and replace-all semantics.

### Modified Capabilities

<!-- none — existing gesture recording/execution and settings behavior is unchanged -->

## Impact

- `popup/popup.html` — new Backup tab header and tab content (buttons, hidden file input).
- `popup/popup-handler.js` — event wiring, export/import flow, UI refresh after import.
- `popup/storage.js` — bulk read/replace methods for both storage keys.
- New popup module(s) for export file building and import parsing/validation.
- `README.md` — description of the Backup tab.
- No manifest changes; no new permissions (export uses a Blob anchor download, import uses a file input).
- Service worker and content scripts unchanged; the existing `updateStorage` message already covers cache refresh.
