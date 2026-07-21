# Design: Add Linux and macOS Support

## Context

Gesture recording starts on right-button `mousedown` and ends on `mouseup`; the native context menu is suppressed only
after a completed gesture, via a one-shot flag set in `#handleMouseUp` and consumed by the `contextmenu` listener
(`content-scripts/content-event-handler.js`). This works because Windows fires `contextmenu` after `mouseup`.

On Linux (GTK convention) and macOS, `contextmenu` fires on `mousedown`. The native menu opens the moment the right
button is pressed, the page stops receiving `mousemove`/`mouseup` while the menu is open, and gesture recording never
runs. Suppression must therefore be decided synchronously at press time, before knowing whether the user will draw a
gesture. A content script cannot open the native context menu programmatically, so the only way to offer the menu is to
decline to suppress a real, subsequent right click — hence double right click.

## Goals / Non-Goals

**Goals:**

- Gestures work on Linux and macOS exactly as they do on Windows.
- The native context menu remains reachable on Linux and macOS via double right click (second click within 500 ms).
- Windows behavior is byte-for-byte unchanged.
- Platform behavior is auto-detected; no new settings, storage keys, or popup UI.

**Non-Goals:**

- No user-configurable time window or context menu mode.
- No modifier-key bypass (e.g. Shift+right-click) in this change.
- No changes to gesture recognition, canvas drawing, operations, or the service worker.

## Decisions

### Platform detection via user agent, defaulting to current behavior

A new `PlatformDetector` class (`content-scripts/platform-detector.js`, registered in `manifest.json` before
`content-event-handler.js`) exposes whether the platform opens the context menu on button press. Detection reads
`navigator.userAgentData.platform` and falls back to `navigator.platform` string matching. `macOS` and `Linux` map to
the press-time menu mode; `Windows` and anything unrecognized keep the current mouseup-time mode, so an unknown platform
degrades to today's behavior rather than to a broken menu.

Alternative considered: detecting the event order at runtime (observing whether `contextmenu` arrives while the right
button is still down). Rejected — it is cleverer than needed, and the first click on every page would behave
unpredictably before detection settles.

The detected mode is computed once in `content.js` and injected into `ContentEventHandler` through the constructor,
following the existing dependency injection convention.

### One `ContentEventHandler` with two context menu modes

`ContentEventHandler` keeps a single `contextmenu` listener that branches on the injected mode with early returns:

- **Windows mode (current behavior, unchanged):** suppress only when the one-shot flag was set by a completed gesture.
- **Press-time mode (Linux/macOS):** suppress every `contextmenu` unless armed. A right-button `mouseup` that produced
  no gesture arms the menu by storing a timestamp. The next `contextmenu` (which arrives on the second press's
  `mousedown`) is allowed through when it occurs within 500 ms of arming, then disarms.

Arming uses timestamp comparison only — no timers to schedule or cancel. The 500 ms window lives as a private constant
in `ContentEventHandler`; it is not shared across contexts, so it does not belong in `Consts`.

In press-time mode the completed-gesture flag is never set: the `contextmenu` for that press already fired at
`mousedown` and was suppressed, so setting the flag on `mouseup` would leak suppression into a future, unrelated menu.

### Cancel recording when the menu is allowed through

The allowed second click's `mousedown` has already snapshotted selection/link and registered the `mousemove` listener
before its `contextmenu` arrives. Once the native menu opens, `mouseup` may be swallowed by the menu and the listener
would stay registered. `GesturesHandler` gets a `cancel()` method (unregister `mousemove`, reset state) that the
`contextmenu` handler calls when letting the menu through. If the platform delivers the `mouseup` anyway, the empty
gesture path re-arms the menu, which is harmless.

### README documents the new interaction

`README.md` drops the Windows-only limitation and documents: on Linux and macOS the context menu opens with a double
right click (second click within half a second), because a single right press starts gesture recording.

## Risks / Trade-offs

- [Core interaction changes on Linux/macOS: the single most common right-click action — opening the menu — now takes two
  clicks on every page] → Inherent to any gesture extension on these platforms; documented in README. A modifier-key
  bypass can be added later if users ask.
- [A user who right-clicks, then within 500 ms presses right again intending to draw, gets the menu instead] → Inherent
  ambiguity of the double-click design; 500 ms is short enough to make this rare.
- [`navigator.userAgentData` may be unavailable or frozen] → Fallback to `navigator.platform`; unknown platforms keep
  current Windows behavior, never a broken menu.
- [Arming state is per frame (`all_frames: true`), so both clicks must land in the same frame] → Acceptable; the two
  clicks of a double click land on the same element in practice.
- [macOS trackpad two-finger tap counts as a full click, so the menu needs two taps] → Consistent with the design;
  covered by the README wording.
- [Pages with their own `contextmenu` handlers (custom menus) still run them; only the native menu is suppressed] → Same
  situation as today on Windows; no new conflict introduced.

## Migration Plan

No storage or data migration. Ship as part of the normal release flow (version bump in `manifest.json`, zip). Rollback
is a revert; Windows users are unaffected either way.

## Open Questions

None blocking. ChromeOS menu timing is unverified; it intentionally falls into the default (current) behavior until
tested.
