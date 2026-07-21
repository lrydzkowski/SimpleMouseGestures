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

## Dependencies

It uses [Coloris v0.22.0](https://github.com/mdbassit/Coloris) to choose a line color in settings.
