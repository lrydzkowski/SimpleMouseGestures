import { ScriptsInjector } from '/service-worker-scripts/scripts-injector.js';
import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';

chrome.runtime.onInstalled.addListener(async () => {
  await new ScriptsInjector().injectAsync();
});

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    const directions = message.directions;
    const operationResolver = new OperationResolver();
    await operationResolver.resolveAsync(directions);
  }
);