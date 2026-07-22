# SimpleMouseGestures

Google Chrome extension that provides the ability to define mouse gestures that will run specific actions in your
browser.

A mouse gesture can be drawn by moving your mouse cursor with the right mouse button pressed inside your browse window.
In settings you can attach a mouse gesture with the specific action.

The list of actions possible to attach to mouse gestures:

- Go Back
- Go Forward
- Open New Tab
- Open Link in New Tab (opens the link under the cursor at gesture start; falls back to a blank new tab)
- Close Current Tab
- Reload Current Tab
- Switch to Left Tab
- Switch to Right Tab
- Close Window
- Minimize Window
- Scroll to Top
- Scroll to Bottom
- Reopen Tab
- Duplicate Tab
- Open New Window
- Search Highlighted Text in Active Tab
- Search Highlighted Text in Inactive Tab
- Close Tabs to the Right

Other settings:

- Line color
- Line width

Settings are saved automatically as you change them and apply to pages loaded after the change.

In the Backup tab you can export all your settings (gesture mappings, line color, line width) to a JSON file and import
them back later. Importing replaces all current settings after confirmation, which makes it easy to restore a backup or
move your configuration to another machine.

It works on Windows, Linux, and macOS.

On Linux and macOS the browser normally opens the context menu the moment the right mouse button is pressed, which would
make drawing gestures impossible. The extension therefore keeps the context menu closed while the right button is used
for gestures. To open the context menu on these systems, right click twice in quick succession (the second click within
half a second) without moving the mouse. On Windows nothing changes: a plain right click opens the context menu as
usual.

## Development

The extension is written in TypeScript and built with [WXT](https://wxt.dev). Node.js 24+ is required.

```shell
npm ci
npm run dev
```

`npm run dev` builds the extension, opens a browser with it loaded, and rebuilds on changes. To load it manually
instead, run `npm run build` and load `.output/chrome-mv3` as an unpacked extension via `chrome://extensions` (Developer
mode → Load unpacked).

Other scripts:

- `npm run typecheck` — TypeScript type checking
- `npm test` — unit tests (Vitest)
- `npm run format` / `npm run format:check` — Prettier
- `npm run zip` — build the Chrome Web Store zip into `.output/`

## Release

Bump `version` in `package.json` and `version_name` in `wxt.config.ts`, then merge the version branch to `master`. The
CI workflow builds, tests, and uploads the store-ready zip as a workflow artifact named `SimpleMouseGestures-<version>`;
download it from the workflow run and upload it to the Chrome Web Store.

## Dependencies

It uses [Coloris](https://github.com/mdbassit/Coloris) (via the
[@melloware/coloris](https://www.npmjs.com/package/@melloware/coloris) npm package) to choose a line color in settings.
