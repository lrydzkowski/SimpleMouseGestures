# Tasks: gesture-input-filter-and-help

## 1. Gesture input filtering

- [x] 1.1 Create `GestureInputSanitizer` in `src/entrypoints/popup/` with a pure `sanitize(value: string): string`
      method that strips all characters outside `[a-zA-Z]`
- [x] 1.2 Add unit tests in `tests/popup/gesture-input-sanitizer.test.ts` covering letters kept (both cases),
      digits/symbols/spaces stripped, mixed input like `u1r-2d`, and empty string
- [x] 1.3 Inject `GestureInputSanitizer` into `PopupHandler` (constructor DI, wired in `main.ts`)
- [x] 1.4 Register an `input` event listener on `.gesture-input` in `PopupHandler` that sanitizes the value and restores
      the caret via `setSelectionRange` using the sanitized before-caret prefix length
- [x] 1.5 Add `text-transform: uppercase` to `.tab[data-name='gestures'] .gesture-input` in `style.css`

## 2. Help dialog

- [x] 2.1 Add the help `dialog` element (`#help-dialog`) to `index.html` with an `h2`, content covering add (letters
      U/R/D/L, arrow-key shortcut, operation select, Add/Enter), modify (delete the row and add the gesture again),
      delete (trash icon), the letter-to-direction mapping, and the rules (max 8 moves, no repeated consecutive moves),
      plus a Close `.button-text` inside `form method="dialog"`
- [x] 2.2 Add the help icon button to the gestures add row in `index.html`: `.icon-button` with an inline question-mark
      SVG (`currentColor`, `aria-hidden`) and `aria-label="Gestures help"`
- [x] 2.3 Register the help button click handler in `PopupHandler` that opens `#help-dialog` via `showModal()`
- [x] 2.4 Add any minor help dialog content styles to `style.css` (e.g. list spacing) while relying on the existing
      element-level `dialog` styles for frame, backdrop, and typography

## 3. Verification

- [x] 3.1 Run `npm run typecheck`, `npm test`, and `npm run format:check`
- [x] 3.2 Manually verify in the popup: typing/pasting non-letters is stripped with the caret preserved, lowercase
      displays uppercase, `X` still triggers the Add-time error, arrow-key entry still works, and the help dialog opens,
      matches the import dialog styling, and closes via Close and Escape
