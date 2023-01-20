// async function injectScripts() {
//   for (const cs of chrome.runtime.getManifest().content_scripts) {
//     for (const tab of await chrome.tabs.query({url: cs.matches})) {
//       chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         files: cs.js,
//       });
//     }
//   }
// }

function serializeDirections(directions) {
  return directions.join('|');
}

function deserializeDirections(serializedDirections) {
  return serializedDirections.split('|');
}

// chrome.runtime.onInstalled.addListener(async () => {
//   console.log('onInstalled');
//   await injectScripts();
// });

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    const directions = message.directions;
    const serializedDirections = serializeDirections(directions);

    if (serializedDirections === 'left') {
      chrome.tabs.goBack();
    }

    if (serializedDirections === 'right') {
      chrome.tabs.goForward();
    }

    if (serializedDirections === 'up') {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      if (!Array.isArray(tabs)) {
        return;
      }

      const activeTabIndex = tabs.findIndex(tab => tab.active === true);
      if (activeTabIndex === -1) {
        return;
      }

      chrome.tabs.create({ active: true, index: activeTabIndex + 1 });
    }

    if (serializedDirections === 'down') {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      if (!Array.isArray(tabs)) {
        return;
      }

      const activeTabIndex = tabs.findIndex(tab => tab.active === true);
      if (activeTabIndex === -1) {
        return;
      }

      const tab = tabs[activeTabIndex];
      chrome.tabs.remove(tab.id);
    }

    if (serializedDirections === 'up|down') {
      chrome.tabs.reload();
    }

    if (serializedDirections === 'up|left') {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      if (!Array.isArray(tabs)) {
        return;
      }

      if (tabs.length === 1) {
        return;
      }

      const activeTabIndex = tabs.findIndex(tab => tab.active === true);
      if (activeTabIndex === -1) {
        return;
      }

      const prevTabIndex = activeTabIndex === 0 ? tabs.length - 1 : activeTabIndex - 1;
      const prevTab = tabs[prevTabIndex];

      chrome.tabs.update(prevTab.id, {active: true, highlighted: true});
    }

    if (serializedDirections === 'up|right') {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      if (!Array.isArray(tabs)) {
        return;
      }

      if (tabs.length === 1) {
        return;
      }

      const activeTabIndex = tabs.findIndex(tab => tab.active === true);
      if (activeTabIndex === -1) {
        return;
      }

      const prevTabIndex = activeTabIndex === tabs.length - 1 ? 0 : activeTabIndex + 1;
      const prevTab = tabs[prevTabIndex];

      chrome.tabs.update(prevTab.id, {active: true, highlighted: true});
    }

    if (serializedDirections === 'left|down|right') {
      const currentWindow = await chrome.windows.getCurrent();
      chrome.windows.remove(currentWindow.id);
    }
  }
);