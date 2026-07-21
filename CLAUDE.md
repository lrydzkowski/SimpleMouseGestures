# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple Mouse Gestures is a Google Chrome extension (Manifest V3) written in vanilla JavaScript. Users draw gestures with
the right mouse button held down; each gesture sequence (up/right/down/left) maps to a browser action (go back, close
tab, etc.). Works on Windows, Linux, and macOS.

## Development

There is no build system, package.json, or test suite — the extension runs directly from the repo files.

- Run: load the repo root as an unpacked extension via `chrome://extensions` (Developer mode → Load unpacked). Reload
  the extension there after changing service worker or manifest files; refresh the page after changing content scripts.
- Format: Prettier, configured in `.prettierrc` (120 print width, single quotes, CRLF). Run `npx prettier --write .` if
  not using the VS Code format-on-save setup. `popup/dependencies/` (vendored Coloris color picker) is excluded via
  `.prettierignore`.
- Release: bump `version` and `version_name` in `manifest.json`; releases are zipped as
  `SimpleMouseGestures<version>.zip` in the repo root. Work happens on version branches (`v0.8.0`), merged to `master`.

This project uses OpenSpec for spec-driven changes (`openspec/` directory, `opsx:*` slash commands).

## Architecture

Three isolated Chrome extension contexts communicate via `chrome.runtime` messages and `chrome.storage.local`:

### Content scripts (`content.js` + `content-scripts/`)

Injected into all URLs, all frames, at `document_start`. These are NOT ES modules — they are plain scripts loaded in
dependency order by the `content_scripts.js` array in `manifest.json` (new files must be added there, before
`content.js`). Classes are globals. `content.js` is the composition root that wires everything.

Flow: `ContentEventHandler` listens for right-button mousedown/mouseup. On mousedown, `SelectedTextHandler` snapshots
the current selection, `LinkHandler` snapshots the nearest http(s) link under the cursor, and `GesturesHandler` starts
recording mouse movement, converting movement angles into a sequence of `up`/`right`/`down`/`left` tokens
(deduplicating consecutive repeats). While recording, a full-screen canvas overlay
(`CanvasBuilder`/`CanvasHandler`/`CanvasEventHandler`) draws the gesture trail using line settings read via
`SettingsStorage`. On mouseup with a non-empty gesture, it sends a `gestures` message (gestures, selected text, link
URL) to the service worker and suppresses the next context menu.

Context menu handling is platform-dependent (`PlatformDetector`): on Linux/macOS the native menu opens on right-button
press, which would interrupt gestures, so `ContentEventHandler` suppresses it by default — a gesture-free right click
arms a 500 ms window during which a second right click opens the native menu. On Windows the menu opens on release, so
only the context menu following a completed gesture is suppressed.

### Service worker (`service-worker.js` + `service-worker-scripts/`)

ES modules (`"type": "module"` in the manifest). Handles two message types: `gestures` (execute the matched operation)
and `updateStorage` (re-read storage after the popup saves changes).

`OperationResolver` serializes the gesture array to a pipe-joined key (`up|left`), looks it up in the stored
gesture→operation map, and calls the matching operation's `doAsync(context)`. `Context` carries the gestures, any
selected text, and the link URL captured under the cursor at gesture start.

To add a new operation: create a class in `service-worker-scripts/operations/` with an async `doAsync(context)` method
(catch and log errors from Chrome APIs, as the existing operations do), then import and register it in the
`OperationResolver.operations` static map with a unique key and display label. The popup's operation dropdown is
populated from that map automatically. Update the action list in `README.md`.

### Popup (`popup/`)

ES modules loaded from `popup.html`; `consts.js` is included as a plain script tag. The UI has three tabs: Gestures
(gesture→operation mappings, validated inline instead of via `alert()`), Settings (line color/width, auto-saved on
change — there is no Save button), and Backup (export/import of all settings as a versioned JSON file; `BackupHandler`
validates imported gestures, operation keys, and settings, then `Storage.replaceAllAsync` replaces everything after a
modal confirmation). It imports `OperationResolver` from `service-worker-scripts/` directly to enumerate available
operations. `GesturesSerializer` converts between the UI letter form (`UL`) and the storage form (`up|left`). After
every save, `popup/storage.js` sends `updateStorage` so the service worker reloads its cached state.

Styling mimics Chrome's design language through CSS custom properties (design tokens) defined in `popup.css`. The
vendored Coloris picker is themed by overriding its public CSS classes from `popup.css` — never edit files in
`popup/dependencies/`.

### Shared state and conventions

- `chrome.storage.local` holds JSON-stringified values under two keys: `simpleMouseGesturesData` (gesture→operation map)
  and `simpleMouseGesturesSettings` (`lineColor`, `lineWidth`). Defaults are seeded by
  `service-worker-scripts/storage.js` on first run.
- There are three separate storage classes — `service-worker-scripts/storage.js` (caches in memory, seeds defaults),
  `popup/storage.js` (read/write, notifies service worker), and `content-scripts/settings-storage.js` (read-only
  settings). The storage keys are duplicated in each; changing them requires touching all three.
- `consts.js` (`Consts` class) is shared globally by both the content scripts and the popup; it defines mouse button
  codes, gesture direction names, and message types.
- Code style: classes with `#private` fields and methods, constructor dependency injection, early returns, no comments.
