# platform-context-menu Delta Specification

## ADDED Requirements

### Requirement: Platform context menu mode detection

The content script SHALL determine once at load time which context menu mode the platform uses: press-time mode for
platforms that open the native context menu on right-button press (macOS, Linux), or release-time mode for platforms
that open it after right-button release (Windows). Detection SHALL read `navigator.userAgentData.platform` when
available and SHALL fall back to `navigator.platform` otherwise. Platforms not recognized as macOS or Linux SHALL use
release-time mode.

#### Scenario: Extension runs on macOS

- **WHEN** the content script loads in a browser reporting the platform as macOS
- **THEN** press-time mode is selected

#### Scenario: Extension runs on Linux

- **WHEN** the content script loads in a browser reporting the platform as Linux
- **THEN** press-time mode is selected

#### Scenario: Extension runs on Windows

- **WHEN** the content script loads in a browser reporting the platform as Windows
- **THEN** release-time mode is selected

#### Scenario: Extension runs on an unrecognized platform

- **WHEN** the content script loads in a browser whose reported platform is neither Windows, macOS, nor Linux
- **THEN** release-time mode is selected

### Requirement: Context menu suppression in press-time mode

In press-time mode, the content script SHALL prevent the native context menu whenever the menu is not armed, so that
gesture recording can run while the right button is held.

#### Scenario: Right button pressed to start a gesture

- **WHEN** the right mouse button is pressed while the menu is not armed
- **THEN** the native context menu is suppressed and gesture recording starts as on Windows

#### Scenario: Gesture completes

- **WHEN** a non-empty gesture is drawn with the right button held and the button is released
- **THEN** the matched operation executes and no native context menu appears at any point

### Requirement: Double right click opens the native menu in press-time mode

In press-time mode, a right-button release that produced no gesture SHALL arm the native context menu for 500 ms. A
`contextmenu` event occurring while armed SHALL be allowed through, SHALL disarm the menu, and SHALL cancel the gesture
recording started by its own button press. A right-button release that produced a non-empty gesture SHALL NOT arm the
menu.

#### Scenario: Double right click within the window

- **WHEN** a right click produces no gesture and a second right click occurs within 500 ms
- **THEN** the native context menu opens on the second click

#### Scenario: Second right click after the window expires

- **WHEN** a right click produces no gesture and the next right click occurs more than 500 ms later
- **THEN** the native context menu stays suppressed and that click arms the menu again

#### Scenario: Right click shortly after a completed gesture

- **WHEN** a non-empty gesture completes and a right click occurs within 500 ms
- **THEN** the native context menu stays suppressed and that click arms the menu

#### Scenario: Allowed menu leaves no recording running

- **WHEN** the native context menu is allowed through on the second click
- **THEN** the recording started by that click's button press is cancelled, no `gestures` message is sent, and no
  `mousemove` listener remains registered

### Requirement: Release-time mode behavior is unchanged

In release-time mode, the extension SHALL keep the existing behavior: the native context menu is suppressed only for the
single `contextmenu` event that follows a completed non-empty gesture, and a plain right click opens the menu
immediately.

#### Scenario: Plain right click on Windows

- **WHEN** the right mouse button is pressed and released without drawing a gesture in release-time mode
- **THEN** the native context menu opens as it does without the extension

#### Scenario: Completed gesture on Windows

- **WHEN** a non-empty gesture completes in release-time mode
- **THEN** the matched operation executes, the immediately following native context menu is suppressed, and the next
  right click opens the menu normally
