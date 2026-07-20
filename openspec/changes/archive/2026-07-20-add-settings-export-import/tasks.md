# Tasks: Add Settings Export / Import

## 1. Storage

- [x] 1.1 Add `replaceAllAsync(gestures, settings)` to `popup/storage.js` writing both storage keys and sending a single
      `updateStorage` message

## 2. Backup module

- [x] 2.1 Create `popup/backup-handler.js` with a `BackupHandler` class (constructor-injected `Storage`) exposing an
      export method that builds the `{ version: 1, gestures, settings }` JSON from stored values
- [x] 2.2 Add import parsing/validation to `BackupHandler`: JSON parse, top-level shape, `version === 1`, gesture key
      rules (1–8 pipe-joined `up`/`right`/`down`/`left` tokens, no consecutive repeats), operation keys checked against
      `OperationResolver.operations`, `lineColor` `#rrggbb` check, `lineWidth` integer 1–10 accepting number or numeric
      string and normalizing to a number; each failure produces a descriptive error naming the offending value

## 3. Popup UI

- [x] 3.1 Add a Backup tab to `popup/popup.html`: a `.header` element and a `.tab` element with `data-name="backup"`
      after Settings, containing an Export button, an Import button, and a hidden file input with
      `accept=".json,application/json"`
- [x] 3.2 Style the Backup tab content in `popup/popup.css` consistent with the existing rows/buttons
- [x] 3.3 Wire the Export button in `popup/popup-handler.js` (left-button mousedown guard): build the file via
      `BackupHandler` and trigger a `Blob` + `<a download="simple-mouse-gestures-backup.json">` download
- [x] 3.4 Wire the Import button and file input in `popup/popup-handler.js`: read the file, validate via
      `BackupHandler`, show validation errors with `alert()`, ask for replacement confirmation with `confirm()` (message
      suggests exporting first), then call `replaceAllAsync` and reset the file input
- [x] 3.5 Refresh the popup after a confirmed import: clear `.list-content`, re-run the gesture list and settings
      restore logic
- [x] 3.6 Instantiate `BackupHandler` in `popup/popup.js` and inject it into `PopupHandler`
- [x] 3.7 Describe the Backup tab (export/import, replace-all semantics) in `README.md`

## 4. Verification

- [x] 4.1 Manual check on Windows Chrome: the Backup tab switches correctly, the popup stays open when the file picker
      and download are triggered, and export then re-import round-trips storage exactly
- [x] 4.2 Manual check of rejection paths: malformed JSON, wrong `version`, invalid gesture key, unknown operation,
      invalid `lineColor`/`lineWidth` — each shows a descriptive error and leaves storage untouched
- [x] 4.3 Manual check: canceling the confirmation leaves storage and UI unchanged; unsaved line-color edits are not
      exported
- [x] 4.4 Run `npx prettier --write .` and reload the unpacked extension to confirm no console errors
