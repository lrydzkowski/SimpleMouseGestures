# Add Linux and macOS Support

## Why

The extension only works on Windows because it suppresses the native context menu after gesture completion, relying on
the Windows event order where `contextmenu` fires after `mouseup`. On Linux and macOS the `contextmenu` event fires on
`mousedown`, so the native menu opens immediately when the right button is pressed and gesture recording never gets a
chance to run.

## What Changes

- Detect the platform in the content script and keep the current behavior on Windows unchanged.
- On Linux and macOS, suppress the native context menu when it fires on right-button press so gestures can be drawn with
  the right button held.
- On Linux and macOS, open the native context menu via double right click: a right click that produces no gesture arms a
  500 ms window during which a second right click lets the native menu through.
- Update `README.md`: remove the Windows-only limitation and document the double-right-click context menu behavior on
  Linux and macOS.

## Capabilities

### New Capabilities

- `platform-context-menu`: Platform-dependent context menu handling — Windows keeps the current suppress-after-gesture
  behavior; Linux and macOS suppress the menu at right-button press and reopen it through a double right click within a
  500 ms window.

### Modified Capabilities

None — existing capability requirements (`open-link-in-new-tab`, `settings-backup`) are unchanged.

## Impact

- `content-scripts/content-event-handler.js`: context menu suppression logic becomes platform-dependent; double-right-
  click arming added.
- `content-scripts/` (new or existing file, e.g. `utils.js`): platform detection helper; a new file must be registered
  in the `content_scripts.js` array in `manifest.json` before `content.js`.
- `content.js`: wiring if a new class is introduced.
- `README.md`: platform support and usage documentation.
- No storage, popup, or service worker changes — behavior is auto-detected, the 500 ms window is a fixed constant.
