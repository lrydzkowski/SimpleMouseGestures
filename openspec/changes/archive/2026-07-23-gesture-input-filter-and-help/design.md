# Design: gesture-input-filter-and-help

## Context

The gesture input (`src/entrypoints/popup/index.html`, `.gesture-input`) is a plain text field. A single `keydown`
listener in `PopupHandler` submits on Enter and appends `U`/`R`/`D`/`L` for arrow keys (programmatic value assignment
via `setTimeout`). All validation happens in `#handleCreateRowEventAsync` when the user clicks Add: trim + uppercase,
non-empty, max 8 characters, only U/R/D/L, no consecutive repeats, no duplicate gesture.

The import confirmation dialog (`#import-dialog`) is styled through element-level selectors in `style.css` (`dialog`,
`dialog h2`, `dialog p`, `dialog .dialog-buttons`), so any additional `dialog` element inherits the same frame,
backdrop, and typography automatically.

There is no edit-in-place for gesture mappings: changing a gesture's operation requires deleting the row and adding it
again.

## Goals / Non-Goals

**Goals:**

- Only letters (A–Z, case-insensitive) can appear in the gesture input, regardless of entry method (typing, paste, drop,
  autofill).
- The field displays its content in uppercase.
- A help icon button on the Gestures tab opens a modal dialog explaining add / modify / delete, the direction letters,
  the arrow-key shortcut, and the gesture rules — visually consistent with the import confirmation dialog.
- Existing Add-time validation messages remain reachable and unchanged.

**Non-Goals:**

- No edit-in-place for gesture rows (the help dialog documents the delete-and-re-add workaround instead).
- No restriction of the input to U/R/D/L only — wrong letters stay visible so the explanatory Add-time error can teach
  the rule.
- No `maxlength` enforcement or changes to the length, repeat, or duplicate validation.
- No changes to the arrow-key entry behavior, storage, messaging, or other extension contexts.

## Decisions

1. **Sanitize on the `input` event, not `keydown`.** An `input` listener rewrites the field value by stripping
   non-letter characters. This covers typing, paste, drag-and-drop, and autofill uniformly; `keydown` + `preventDefault`
   misses everything except typing. The existing `keydown` listener stays as-is for Enter and arrow keys. Arrow-key
   appends assign `.value` programmatically, which fires no `input` event — they bypass the sanitizer harmlessly because
   they only append valid uppercase letters.
2. **Letters means ASCII A–Z.** The sanitizer strips everything matching `[^a-zA-Z]`. Gestures can only ever contain
   U/R/D/L, so broader Unicode letter support has no value; non-ASCII letters are stripped like symbols.
3. **Uppercase display via CSS `text-transform: uppercase`** on `.gesture-input`. The field value keeps the typed case;
   the existing `toUpperCase()` in `#handleCreateRowEventAsync` normalizes the value at Add time, so stored values and
   validation are unaffected. This avoids rewriting the value case in JS and touching the caret on every keystroke.
   Alternative considered: uppercasing the value in the `input` handler — rejected as redundant with the Add-time
   normalization and more intrusive.
4. **Caret preservation when stripping.** When the sanitizer removes characters, the caret position is restored as
   `sanitize(valueBeforeCaret).length` via `setSelectionRange`; without this the caret jumps to the end after a rejected
   character mid-string.
5. **Sanitizer as a small class** (`GestureInputSanitizer` in `src/entrypoints/popup/`) with a pure
   `sanitize(value: string): string` method, injected into `PopupHandler` like `GesturesSerializer`. Rationale: matches
   the existing pattern (small popup classes, constructor DI) and makes the logic unit-testable without instantiating
   `PopupHandler`, which has no test today. Alternative considered: inline regex in `PopupHandler` — simpler but
   untestable under the current test layout.
6. **Help button as an `.icon-button` with an inline SVG question-mark icon**, placed in the add row after the Add
   button, with `aria-label="Gestures help"`. Matches the delete buttons' pattern (icon-button + inline `currentColor`
   SVG).
7. **Help dialog as a second `<dialog>`** (`#help-dialog`) in `index.html`, opened with `showModal()` and closed by a
   single Close `.button-text` inside `form method="dialog"` (Escape works natively). No Promise wrapper — unlike the
   import dialog, nothing depends on a return value. Element-level `dialog` styles provide the visual consistency; only
   minor content styles (e.g. list spacing) may be added.
8. **Help dialog content** covers: adding (type U/R/D/L or press arrow keys, pick an operation, Add or Enter); modifying
   (delete the row, then add the gesture again with the new operation — stated honestly, since there is no in-place
   editing); deleting (the trash icon on a row); the letter-to-direction mapping; and the rules (max 8 moves, no
   repeated consecutive moves).

## Risks / Trade-offs

- [Silently stripped characters can look like a broken input] → The help button sits next to the field and explains the
  allowed letters; wrong letters (A–Z outside U/R/D/L) still surface the existing explanatory Add-time error.
- [`text-transform` is display-only, so the field value may be lowercase until Add] → Acceptable: Add-time normalization
  already uppercases before validation and storage; nothing reads the raw field value elsewhere.
- [IME composition events also fire `input`, so stripping could disrupt composition] → Accepted: composed CJK characters
  are non-letters and would be stripped at composition end anyway; gestures cannot contain them.
- [happy-dom input/selection behavior may differ from Chrome] → Unit tests target the pure sanitizer; the DOM wiring is
  verified manually in the popup, consistent with the untested `PopupHandler` today.
