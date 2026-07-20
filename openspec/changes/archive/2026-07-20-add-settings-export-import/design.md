# Design: Add Settings Export / Import

## Context

All extension state lives in `chrome.storage.local` under two JSON-stringified keys: `simpleMouseGesturesData`
(gesture→operation map in storage form, e.g. `"up|left": "switchToLeftTab"`) and `simpleMouseGesturesSettings`
(`lineColor`, `lineWidth`). The popup (`popup/`) is an ES-module context that already imports `OperationResolver` from
`service-worker-scripts/` to enumerate valid operations, and its `Storage` class notifies the service worker via an
`updateStorage` runtime message after every write. The popup has two tabs (Gestures, Settings) driven by paired
`.header`/`.tab` elements matched on `data-name`; `PopupHandler.#registerTabEvent` binds to all `.header` elements
generically. All user feedback in the popup goes through `alert()`.

## Goals / Non-Goals

**Goals:**

- A dedicated Backup tab in the popup hosting the export and import actions.
- One-click export of the full configuration (gestures + line settings) to a JSON file.
- Import from such a file that atomically replaces all stored configuration after explicit user confirmation.
- All-or-nothing import validation: any problem rejects the entire file with a descriptive message.
- No new permissions and no manifest changes.

**Non-Goals:**

- Merge/partial import, multiple profiles, or cloud sync.
- Migrating old export versions (there are none yet; `version` exists to enable this later).
- Refactoring the existing letter-form gesture input validation in `PopupHandler`.

## Decisions

### File format

```json
{
  "version": 1,
  "gestures": { "up|left": "switchToLeftTab" },
  "settings": { "lineColor": "#000000", "lineWidth": 2 }
}
```

- Gestures use the storage form (pipe-joined tokens), so import/export round-trips storage exactly; no conversion
  through the UI letter form (`UL`).
- `version` is a literal `1`; import rejects any other value. This is the hook for future format migrations.
- Export filename: `simple-mouse-gestures-backup.json`.

### Export mechanics

Read both keys from storage via the existing `Storage` methods (`getAllGesturesAsync`, `getSettingsAsync`), build the
JSON, and trigger a download with `Blob` + `URL.createObjectURL` + a programmatically clicked `<a download>` element.
Alternative considered: `chrome.downloads.download` — rejected because it requires adding the `downloads` permission for
no functional gain. Export reads storage, not the UI inputs, so unsaved form edits are intentionally excluded.

### Backup tab

The actions live in a new third tab named "Backup" (`data-name="backup"`), added as a `.header`/`.tab` pair in
`popup.html` after Settings. The existing tab-switching code queries all `.header` elements and resolves the target by
`data-name`, so no JavaScript changes are needed for the tab itself. Alternative considered: a section inside the
Settings tab — rejected in favor of a dedicated tab so backup actions (which cover gestures too, not just settings) are
not nested under a tab named for line settings.

### Import mechanics

A hidden `<input type="file" accept=".json,application/json">` in the Backup tab, triggered by the Import button. Read
the file with `File.text()`, parse, validate, then `confirm()` describing that all current gestures and settings will be
replaced. On confirmation, write both keys and refresh the popup UI. `confirm()`/`alert()` match the popup's existing
feedback style.

### Validation rules (reject whole file on first failure)

- Parses as JSON; top level is an object.
- `version` is exactly `1`.
- `gestures` is an object; each key is 1–8 tokens joined by `|`, every token one of `up`/`right`/`down`/`left`, no two
  consecutive tokens equal; each value is an operation key present in `OperationResolver.operations`.
- `settings` is an object; `lineColor` matches `#rrggbb` (hex); `lineWidth` is an integer 1–10, accepted as number or
  numeric string and normalized to a number on import. (Tolerance is needed because the current popup saves `lineWidth`
  as a string while the seeded default is a number, so existing exports can legitimately contain either.)

Validation of the storage-form gesture keys is self-contained in the new backup module. It intentionally duplicates the
rules that `PopupHandler` applies to letter-form input rather than extracting a shared validator — the forms differ, the
rules are ~15 lines, and keeping the existing input path untouched minimizes blast radius.

### Replace semantics and storage API

Import replaces both keys wholesale. `popup/storage.js` gets one new method, `replaceAllAsync(gestures, settings)`,
which writes both keys and sends a single `updateStorage` message — reusing the existing per-key save methods would send
two messages and imply merge semantics that do not apply here.

### New module and wiring

New `popup/backup-handler.js` exporting a `BackupHandler` class (constructor-injected `Storage`, matching project DI
style) that owns export file building and import parsing/validation. `PopupHandler` wires the DOM events (mousedown with
left-button guard, matching existing buttons) and owns UI feedback and refresh. New script is imported from `popup.js`;
no manifest change since popup scripts are ES modules, not content scripts.

### Post-import UI refresh

Clear `.list-content` and re-run the existing restore logic (`#restoreListAsync`, `#restoreSettingsAsync`). Alternative
considered: `location.reload()` — simpler, but it resets the popup to the Gestures tab, jarring since the user is on the
Backup tab mid-flow.

## Risks / Trade-offs

- [Popup closing when the OS file picker opens] → Known historical Chrome quirk. Verify manually on Windows during
  implementation; if the popup closes, fall back to opening the picker before any async work or move import to a
  dedicated options page (scope change, unlikely to be needed on current Chrome).
- [Files exported by a future version list operations unknown to this version] → Rejected whole-file by design; the
  error message names the unknown operation key so the user understands why.
- [`confirm()`/`alert()` are blocking and plain] → Accepted; consistent with the popup's existing UX, and replacing the
  feedback mechanism is out of scope.
- [Import overwrites user data irreversibly] → Mitigated by the explicit confirmation dialog; users who want a safety
  net can export first, which the confirmation message suggests.
