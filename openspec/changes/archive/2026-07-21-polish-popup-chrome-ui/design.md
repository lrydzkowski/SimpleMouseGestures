# Design: Polish Popup to Match Chrome UI

## Context

The popup (`popup/`) is a 500px-wide three-tab settings UI (Gestures, Settings, Backup) built with plain HTML/CSS and ES
modules, no build system. Current styling uses black 1px borders, file-folder tabs, and dashed separators. Feedback goes
through `alert()`/`confirm()`, all buttons listen to `mousedown` (so keyboard activation does not work), tab headers are
non-focusable `div`s, and the Settings tab requires an explicit Save click. The color input is enhanced by a vendored
Coloris picker (`popup/dependencies/`, excluded from Prettier). Content scripts read line settings once per page load,
so setting changes only affect newly loaded pages.

## Goals / Non-Goals

**Goals:**

- Make the popup visually consistent with Chrome's 2023 GM3 refresh (light mode).
- Match Chrome settings behavior: auto-save on change, non-blocking inline feedback, keyboard-accessible controls.
- Keep all changes inside `popup/` (plus this change's docs); no service worker or content script changes.
- No new dependencies, no build step.

**Non-Goals:**

- Dark mode (`prefers-color-scheme`) support.
- Matching user-installed Chrome themes (no extension API exists for this).
- Live-applying line settings to already-open tabs; the page-reload requirement stays and is communicated in the UI.
- Restyling Coloris internals beyond what its public class names allow.
- Regenerating Chrome Web Store screenshots.

## Decisions

### 1. Design tokens as CSS custom properties

Define a GM3-inspired token set on `:root` in `popup.css` and reference tokens everywhere. Hardcoded hex values are
required because extensions cannot read Chrome's internal color tokens.

| Token                    | Value     | Use                                   |
| ------------------------ | --------- | ------------------------------------- |
| `--color-primary`        | `#0b57d0` | Filled buttons, tab indicator, focus  |
| `--color-on-primary`     | `#ffffff` | Text on filled buttons                |
| `--color-text`           | `#1f1f1f` | Primary text                          |
| `--color-text-secondary` | `#474747` | Captions, secondary labels            |
| `--color-outline`        | `#747775` | Outlined button and control borders   |
| `--color-divider`        | `#c4c7c5` | Hairline row and tab-bar dividers     |
| `--color-surface`        | `#ffffff` | Popup background                      |
| `--color-chip`           | `#f0f4f9` | Gesture code chip background          |
| `--color-error`          | `#b3261e` | Inline validation and error messages  |
| `--radius-full`          | `999px`   | Pill buttons                          |
| `--radius-small`         | `8px`     | Inputs, selects, chips, message areas |
| `--radius-dialog`        | `20px`    | Import confirmation dialog            |

Hover/pressed state layers use `color-mix()` (e.g. `color-mix(in srgb, var(--color-primary) 92%, #ffffff)` for filled
hover, `color-mix(in srgb, var(--color-text) 8%, transparent)` over transparent controls) instead of hand-picked hover
hexes. `color-mix()` is supported since Chrome 111; the popup only ever runs in the user's current Chrome.

Font stack becomes `system-ui, sans-serif` (Segoe UI on Windows, matching Chrome's native UI); the unused Open Sans
entry is dropped. Base size stays 13px, which already matches Chrome WebUI density.

### 2. Tabs: real buttons with underline indicator

Tab headers become `<button>` elements inside the existing `.headers` container, styled as plain text labels with a 3px
rounded underline indicator on the active tab (GM3 style) and a hairline divider under the whole tab bar. Add
`role="tablist"`/`role="tab"`/`aria-selected` and `role="tabpanel"` on tab panels. Switching stays on `click`.

Alternative considered: full ARIA roving-tabindex with arrow-key navigation — rejected as overkill for three tabs;
standard Tab-key focus between buttons is sufficient and matches the effort level of the rest of the popup.

### 3. Buttons: pill shapes, `click` handlers, no left-button guards

- Primary (filled): Add, dialog confirm. Secondary (outlined): Export, Import. Height 32px, padding 0 16px,
  `--radius-full`.
- Delete becomes a 32px circular icon button with an inline SVG trash icon (no external assets), transparent background,
  state-layer hover. Built in `#createRow`.
- All popup `mousedown` listeners on buttons become `click` listeners, which makes Enter/Space work. The
  `event.button !== Consts.leftButton` guards are removed — `click` only fires for the primary button. Content scripts
  keep using `Consts` untouched.
- Visible focus: `:focus-visible` outline `2px solid var(--color-primary)` with 2px offset on all interactive elements.

### 4. Inline validation on the Gestures tab

`#showValidationError` writes the message into a dedicated error element under the add row (red `--color-error` text,
`aria-live="polite"`) and focuses the input, instead of calling `alert()`. The error clears on the next input keydown
and on a successful add. `#showMessage`'s remaining popup-blocking uses disappear with the changes below, so the
`alert()`-based implementation is deleted.

### 5. Import confirmation via `<dialog>`

Add a `<dialog>` element to `popup.html` styled as a GM3 dialog (title, body text, trailing text buttons Cancel /
Replace). A promise-returning helper (`#confirmReplaceAsync()`) calls `showModal()` and resolves true/false from the
button choice or cancel/Esc. `<dialog>` provides focus trapping and Esc handling natively.

Alternatives considered: keeping `confirm()` (rejected — a native OS-styled dialog inside a GM3 popup defeats the
purpose); a custom overlay div (rejected — reimplements what `<dialog>` gives for free).

### 6. Backup tab inline message area

A message element on the Backup tab replaces `alert()` for import validation errors and the import success note, with
error (`--color-error`) and success (secondary text) variants and `aria-live="polite"`. It clears when a new
import/export starts. Long validation messages remain readable because the area is persistent, unlike a toast.

### 7. Settings auto-save

- Remove the Save button and `#registerSaveSettingsButtonEvent`.
- Save on the `change` event of both `#line-width` and `#line-color`. Coloris dispatches standard `input` (while
  picking) and `change` (on close/confirm) events on the bound input, so saving on `change` avoids write storms while
  dragging. `#restoreSettingsAsync` dispatches only an `input` event, so restoring values does not trigger a save.
- Saves are idempotent (`popup/storage.js#saveSettingsAsync` overwrites the settings key and pings the service worker),
  so an occasional redundant `change` is harmless.
- A persistent caption under the controls reads: "Changes are saved automatically and apply to pages loaded after the
  change." — replacing the post-save `alert()`.

### 8. Gesture list rows

Row layout flips to Chrome's list pattern: gesture code first as a small chip (`--color-chip` background,
`--radius-small`), operation label as regular text, spacer, trailing delete icon button. Rows are 40px with hairline
bottom dividers. The `Event:` label bug becomes `Operation` implicitly — the new row renders the operation label without
a prefix, mirroring Chrome list rows (chip + text are self-explanatory).

### 9. Coloris theming

The vendored `coloris.min.css` exposes no CSS custom properties, so `popup.css` overrides its public classes
(`.clr-field`, `.clr-picker`, button/swatch classes as needed): rounded corners via `--radius-small`, GM3-consistent
shadow and borders. Vendored files stay untouched and Prettier-ignored. Exact selector list is determined during
implementation against the vendored build.

## Risks / Trade-offs

- [Coloris `change` event timing differs from assumption] → Verify during implementation by logging; worst case,
  debounce saves by ~200ms. Saves are idempotent either way.
- [Removing left-button guards changes semantics if a middle-click paste-like gesture hits a button] → `click` fires
  only for primary-button presses per spec; middle/right clicks on buttons do nothing, which is the desired Chrome
  behavior.
- [Hardcoded GM3 hexes drift as Chrome's design evolves] → Tokens are centralized in one `:root` block, so a future
  re-tint is a value swap.
- [No dark mode while GM3 look implies theme-awareness] → Explicitly out of scope per proposal; the light palette is
  self-consistent.
- [`<dialog>` and `color-mix()` browser support] → Both are supported well below the Chrome versions that support MV3
  extensions currently shipping; no fallback needed.

## Open Questions

- None blocking. Exact Coloris override selectors and the trash icon SVG path are implementation details resolved in the
  tasks.
