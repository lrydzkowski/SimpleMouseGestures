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
- Search Highlighted Text
- Close Tabs to the Right

Other settings:

- Line color
- Line width

In the Backup tab you can export all your settings (gesture mappings, line color, line width) to a JSON file and import
them back later. Importing replaces all current settings after confirmation, which makes it easy to restore a backup or
move your configuration to another machine.

It works only in Windows operating system.

## Dependencies

It uses [Coloris v0.22.0](https://github.com/mdbassit/Coloris) to choose a line color in settings.
