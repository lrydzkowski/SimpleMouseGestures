import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';

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

// chrome.runtime.onInstalled.addListener(async () => {
//   console.log('onInstalled');
//   await injectScripts();
// });

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    const directions = message.directions;
    const operationResolver = new OperationResolver();
    await operationResolver.resolveAsync(directions);
  }
);