import { ScriptsInjector } from '/service-worker-scripts/scripts-injector.js';
import { Storage } from '/service-worker-scripts/storage.js';
import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';

const scriptsInjector = new ScriptsInjector();
const storage = new Storage();
storage.initAsync();
const operationResolver = new OperationResolver(storage);

chrome.runtime.onInstalled.addListener(async () => {
  await scriptsInjector.injectAsync();
});

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    console.log(message);
    switch (message.type) {
      case 'gestures':
        await operationResolver.resolveAsync(message.gestures);
        break;
      case 'updateStorage':
        await storage.initAsync();
        break;
    }
  }
);