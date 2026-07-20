# Tasks: Add Linux and macOS Support

## 1. Platform Detection

- [x] 1.1 Create `content-scripts/platform-detector.js` with a `PlatformDetector` class exposing whether the platform
      uses press-time context menus (macOS/Linux via `navigator.userAgentData.platform`, falling back to
      `navigator.platform`; anything unrecognized is release-time)
- [x] 1.2 Register `content-scripts/platform-detector.js` in the `content_scripts.js` array in `manifest.json` before
      `content-scripts/content-event-handler.js`

## 2. Gesture Recording Cancellation

- [x] 2.1 Add a `cancel()` method to `GesturesHandler` that unregisters the `mousemove` listener and resets recording
      state

## 3. Context Menu Modes

- [x] 3.1 Inject the detected mode into `ContentEventHandler` via the constructor and wire it in `content.js`
- [x] 3.2 Branch the `contextmenu` handler: keep the existing one-shot suppression in release-time mode; in press-time
      mode suppress every menu unless armed
- [x] 3.3 In press-time mode, arm the menu with a timestamp on a right-button `mouseup` that produced no gesture, and
      skip setting the release-time one-shot flag when a gesture completed
- [x] 3.4 In press-time mode, allow the `contextmenu` through when it arrives within the 500 ms window (private constant
      in `ContentEventHandler`), disarm, and call `GesturesHandler.cancel()`

## 4. Documentation and Verification

- [x] 4.1 Update `README.md`: remove the Windows-only limitation, list Linux and macOS support, and document the
      double-right-click context menu behavior
- [x] 4.2 Run `npx prettier --write .` and verify formatting
- [x] 4.3 Manually verify on Windows (unchanged behavior: plain right click opens menu, gesture suppresses one menu) and
      on Linux or macOS (gestures work, double right click opens menu, single click does not)
