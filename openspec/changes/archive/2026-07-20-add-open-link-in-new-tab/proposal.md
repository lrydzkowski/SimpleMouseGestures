# Proposal: Add Open Link in New Tab Operation

## Why

Users often start a gesture while the cursor is on a link and expect the extension to act on that link, but the current
"Open New Tab" operation can only open a blank new tab. Adding a link-aware variant lets users open the link under the
cursor in a new tab with a single gesture, without changing the behavior of the existing operation.

## What Changes

- Add a new operation "Open Link in New Tab" to the operation dropdown in the popup, implemented as a second
  registration of the existing `OpenNewTabOperation` with a constructor flag (following the
  `SearchHighlightedTextOperation` active/inactive precedent).
- Capture the link under the cursor when a gesture starts: on right-button mousedown, a new content-script handler
  snapshots the nearest anchor's URL from the event's composed path (covering links inside open shadow roots), keeping
  it only when the resolved URL uses the `http:` or `https:` protocol.
- Extend the `gestures` runtime message and the service-worker `Context` with a `linkUrl` field, alongside the existing
  `selectedText` precedent.
- When the new operation runs with a captured link, it opens that URL in a new tab next to the active tab; when the
  gesture did not start on an http(s) link, it falls back to opening a blank new tab (current "Open New Tab" behavior).
- Update the action list in `README.md`.

## Capabilities

### New Capabilities

- `open-link-in-new-tab`: Capturing the http(s) link under the cursor at gesture start and opening it in a new tab via a
  dedicated "Open Link in New Tab" operation, with fallback to a blank new tab when no link was captured.

### Modified Capabilities

None. No existing specs are present in `openspec/specs/`, and the behavior of existing operations is unchanged.

## Impact

- `manifest.json`: register the new content-script file before `content.js` in the `content_scripts.js` array.
- `content-scripts/link-handler.js` (new): snapshots the link URL under the cursor on gesture start.
- `content.js`: wire the new handler into the composition root.
- `content-scripts/content-event-handler.js`: call the link handler on mousedown and add `linkUrl` to the `gestures`
  message.
- `service-worker.js`: pass `message.linkUrl` into `Context`.
- `service-worker-scripts/context.js`: add the `linkUrl` field.
- `service-worker-scripts/operations/open-new-tab-operation.js`: accept a constructor flag and open `context.linkUrl`
  when the flag is set and a link was captured.
- `service-worker-scripts/operation-resolver.js`: register the `openLinkInNewTab` entry with the "Open Link in New Tab"
  label; the popup dropdown picks it up automatically.
- `README.md`: document the new action.
