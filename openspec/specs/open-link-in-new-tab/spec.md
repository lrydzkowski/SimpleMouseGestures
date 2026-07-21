# open-link-in-new-tab Specification

## Purpose

Allow a mouse gesture that starts on a hyperlink to capture that link's URL and open it in a new tab, while keeping the
existing blank "Open New Tab" behavior unchanged.

## Requirements

### Requirement: Link capture at gesture start

The content script SHALL capture the URL of the link under the cursor when the right mouse button is pressed, before
gesture recording starts. The captured value SHALL be the resolved absolute URL of the nearest HTML anchor element with
an `href` attribute in the event's composed path, including anchors inside open shadow roots, and SHALL be kept only
when its protocol is `http:` or `https:`. In all other cases the captured value SHALL be empty. The captured value SHALL
be reset on every gesture start.

#### Scenario: Gesture starts on an http(s) link

- **WHEN** the right mouse button is pressed on an anchor element whose `href` resolves to an `http:` or `https:` URL
- **THEN** the resolved absolute URL is captured for the current gesture

#### Scenario: Gesture starts on an element nested inside a link

- **WHEN** the right mouse button is pressed on an element (such as an image or span) contained within an anchor element
  with an http(s) `href`
- **THEN** the nearest enclosing anchor's resolved URL is captured

#### Scenario: Gesture starts on a link inside an open shadow root

- **WHEN** the right mouse button is pressed on an anchor element with an http(s) `href` located inside an open shadow
  root, so that the event target seen outside the shadow root is the host element
- **THEN** the anchor's resolved URL is captured

#### Scenario: Gesture starts on a link inside a closed shadow root

- **WHEN** the right mouse button is pressed on an anchor element located inside a closed shadow root
- **THEN** no link URL is captured for the current gesture

#### Scenario: Gesture starts outside any link

- **WHEN** the right mouse button is pressed on an element with no ancestor anchor element
- **THEN** no link URL is captured for the current gesture

#### Scenario: Gesture starts on a non-http(s) link

- **WHEN** the right mouse button is pressed on an anchor whose `href` resolves to a protocol other than `http:` or
  `https:` (such as `javascript:` or `mailto:`)
- **THEN** no link URL is captured for the current gesture

#### Scenario: Previous gesture's link does not leak

- **WHEN** a gesture previously started on a link and a new gesture starts outside any link
- **THEN** the previously captured link URL is discarded and no link URL is associated with the new gesture

### Requirement: Link URL delivery to operations

The `gestures` runtime message SHALL include a `linkUrl` field containing the captured link URL (or an empty string),
and the service worker SHALL expose it to operations through the `Context` object.

#### Scenario: Completed gesture carries the captured link

- **WHEN** a non-empty gesture is completed after starting on an http(s) link
- **THEN** the `gestures` message sent to the service worker contains the captured URL in `linkUrl` and the resolved
  operation receives it via `context.linkUrl`

### Requirement: Open Link in New Tab operation

The extension SHALL provide an "Open Link in New Tab" operation, selectable in the popup's operation dropdown. When
executed with a captured link URL, it SHALL open that URL in a new active tab positioned directly to the right of the
active tab. When executed without a captured link URL, it SHALL open a blank new tab identically to the existing "Open
New Tab" operation.

#### Scenario: Operation is available in the popup

- **WHEN** the popup's operation dropdown is populated
- **THEN** it contains an "Open Link in New Tab" entry

#### Scenario: Gesture starts on a link

- **WHEN** a gesture mapped to "Open Link in New Tab" is drawn starting on an http(s) link
- **THEN** a new active tab opens with the link's URL, positioned directly to the right of the active tab

#### Scenario: Gesture does not start on a link

- **WHEN** a gesture mapped to "Open Link in New Tab" is drawn starting outside any http(s) link
- **THEN** a blank new active tab opens directly to the right of the active tab

### Requirement: Existing Open New Tab operation is unchanged

The existing "Open New Tab" operation SHALL ignore any captured link URL and SHALL continue to open a blank new tab.

#### Scenario: Open New Tab gesture starts on a link

- **WHEN** a gesture mapped to "Open New Tab" is drawn starting on an http(s) link
- **THEN** a blank new active tab opens directly to the right of the active tab and the link URL is not opened
