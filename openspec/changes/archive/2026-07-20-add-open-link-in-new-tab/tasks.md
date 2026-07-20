# Tasks: Add Open Link in New Tab Operation

## 1. Link capture in content scripts

- [x] 1.1 Create `content-scripts/link-handler.js` with a `LinkHandler` class exposing `saveLink(event)` and
      `getLink()`: reset the stored value, scan `event.composedPath()` for the first `HTMLAnchorElement` with an `href`
      attribute, parse its `href` property with `new URL(...)`, and keep the URL only when the protocol is `http:` or
      `https:`
- [x] 1.2 Register `content-scripts/link-handler.js` in the `content_scripts.js` array in `manifest.json`, before
      `content.js`
- [x] 1.3 Instantiate `LinkHandler` in `content.js` and pass it to `ContentEventHandler`
- [x] 1.4 In `content-scripts/content-event-handler.js`, call `linkHandler.saveLink(event)` on right-button mousedown
      and add `linkUrl: linkHandler.getLink()` to the `gestures` message on mouseup

## 2. Service worker plumbing

- [x] 2.1 Add a `linkUrl` field to `service-worker-scripts/context.js` and set it from `message.linkUrl` in
      `service-worker.js`

## 3. Operation variant

- [x] 3.1 Add an `openLink` constructor flag to `service-worker-scripts/operations/open-new-tab-operation.js`; when the
      flag is set and `context.linkUrl` is a non-empty string, create the new tab with that URL, otherwise keep the
      current blank-tab behavior (active tab, positioned right of the active tab)
- [x] 3.2 In `service-worker-scripts/operation-resolver.js`, construct the existing `openNewTab` entry with the flag off
      and register a new `openLinkInNewTab` entry with the flag on and the label "Open Link in New Tab"

## 4. Documentation and verification

- [x] 4.1 Add "Open Link in New Tab" to the action list in `README.md`
- [x] 4.2 Run `npx prettier --write .` and reload the unpacked extension
- [x] 4.3 Manually verify the spec scenarios: gesture on a link opens the link URL, gesture on a nested element inside a
      link works, gesture on a link inside an open shadow root works (for example on a site built with web components),
      gesture off a link opens a blank tab, `javascript:`/`mailto:` links open a blank tab, and a gesture mapped to the
      existing "Open New Tab" still opens a blank tab when started on a link
