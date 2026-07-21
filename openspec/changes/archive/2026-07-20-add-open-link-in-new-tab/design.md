# Design: Add Open Link in New Tab Operation

## Context

The extension records gestures drawn with the right mouse button. On mousedown, `ContentEventHandler` already snapshots
page state through `SelectedTextHandler`; on mouseup it sends a `gestures` runtime message (`gestures`, `selectedText`)
to the service worker, where `Context` carries the data into the resolved operation. `OperationResolver.operations` is a
static map of pre-constructed operation instances; the popup dropdown is populated from it automatically.
`SearchHighlightedTextOperation` is registered twice with a constructor flag (active/inactive tab), establishing the
pattern for behavior variants of one operation class.

## Goals / Non-Goals

**Goals:**

- Let a gesture that starts on an http(s) link open that link in a new tab, as a separate dropdown operation.
- Keep the existing "Open New Tab" operation behavior unchanged.
- Reuse the existing snapshot-on-mousedown and `Context` plumbing patterns.

**Non-Goals:**

- No global settings toggle; the choice is made per gesture via the operation dropdown.
- No capture of links inside closed shadow roots and no SVG `<a>` support; such gestures fall back to the no-link
  behavior.
- No background-tab variant of the new operation.
- No changes to storage keys, settings shape, or the popup settings tab.

## Decisions

### Second dropdown entry instead of a settings toggle

`OpenNewTabOperation` gains a constructor flag (`openLink`) and is registered twice in `OperationResolver.operations`:
the existing `openNewTab` entry with the flag off and a new `openLinkInNewTab` entry ("Open Link in New Tab") with the
flag on. This follows the `SearchHighlightedTextOperation` precedent.

Alternative considered: a checkbox in the popup settings tab. Rejected because operations never read settings today
(settings are consumed only by content scripts), operation instances are constructed at module load before storage is
initialized, and existing users' stored settings objects would need default merging in multiple storage classes. The
dropdown variant needs none of that and allows per-gesture choice.

### Link capture in a new `LinkHandler` content script

A new `content-scripts/link-handler.js` mirrors `SelectedTextHandler`: `ContentEventHandler` calls `saveLink(event)` on
right-button mousedown and reads `getLink()` on mouseup. The handler:

- Resets the stored value on every call so a previous gesture's link never leaks into the next one.
- Finds the anchor by scanning `event.composedPath()` for the first `HTMLAnchorElement` with an `href` attribute. The
  composed path crosses open shadow boundaries, so links inside open shadow roots are found even though `event.target`
  is retargeted to the shadow host; in the regular DOM the path is simply the ancestor chain. The
  `instanceof HTMLAnchorElement` check also excludes SVG `<a>` elements (`SVGAElement`) naturally.
- Parses the anchor's `href` property with `new URL(...)` and keeps it only when the protocol is `http:` or `https:`;
  the property already resolves relative URLs against the document base.
- Stores an empty string in every other case, matching the `selectedText` convention.

The file must be added to the `content_scripts.js` array in `manifest.json` before `content.js`, and wired in the
`content.js` composition root as a new constructor dependency of `ContentEventHandler`.

Alternative considered: `event.target.closest('a[href]')`. Rejected because shadow DOM event retargeting makes
`event.target` the shadow host for presses inside a shadow root, so links inside web components would never be found;
`composedPath()` handles shadow and regular DOM with the same scan.

Alternative considered: capturing on mouseup instead of mousedown. Rejected because the cursor has moved away from the
link by the end of the gesture; mousedown is the moment the user aims at the link, and it matches the
`SelectedTextHandler` timing.

### `linkUrl` travels through the existing message and `Context`

The `gestures` message gains a `linkUrl` field next to `selectedText`; `service-worker.js` passes it into `Context`,
which gains a `linkUrl` property. Operations that do not care about it are unaffected.

### Fallback to a blank new tab

When the flag is on but `context.linkUrl` is empty, the operation behaves exactly like "Open New Tab". A gesture should
always do something predictable; silently doing nothing would look like a broken gesture. Tab placement and focus stay
as today: created next to the active tab with `active: true`.

## Risks / Trade-offs

- Fragment-only links (`href="#top"`) resolve to the current page's http(s) URL and are therefore captured; the gesture
  opens the same page in a new tab. → Accepted; the http(s) rule stays simple and predictable.
- `composedPath()` omits the inside of closed shadow roots, so links there are not captured. → The gesture falls back to
  a blank new tab; closed shadow roots are rare and their content is inaccessible to scripts by design.
- On link-dense pages, gestures frequently start on links unintentionally. → Contained by design: only gestures
  explicitly mapped to "Open Link in New Tab" are affected; "Open New Tab" is untouched.
- `chrome.tabs.create` can reject unexpected URLs. → The http(s) filter removes the known-blocked cases (`javascript:`);
  the operation keeps the existing catch-and-log convention for Chrome API errors.
