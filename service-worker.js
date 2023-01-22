import { ScriptsInjector } from '/service-worker-scripts/scripts-injector.js';
import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';
import { Storage } from '/service-worker-scripts/storage.js';

const scriptsInjector = new ScriptsInjector();
const storage = new Storage();
const operationResolver = new OperationResolver(storage);

chrome.runtime.onInstalled.addListener(async () => {
  await scriptsInjector.injectAsync();
  await storage.initAsync();
});

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    await operationResolver.resolveAsync(message.directions);
  }
);