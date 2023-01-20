# SimpleMouseGestures

Google Chrome extension that provides mouse gestures.

Actions possible to attach to mouse gestures:

- Go Back - `chrome.tabs.goBack()`
- Go Forward - `chrome.tabs.goForward()`
- Create a New Tab - `chrome.tabs.create({active: true})`
- Close Current Tab - `chrome.tabs.remove(tab.id)`
- Reload Current Tab - `chrome.tabs.reload()`
- Switch to Previous Tab - `chrome.tabs.update(prevTab.id, {active: true, highlighted: true})`
- Switch to Next Tab - `chrome.tabs.update(prevTab.id, {active: true, highlighted: true})`
- Close Window - `chrome.windows.remove(currentWindow.id)`
