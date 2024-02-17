import { Storage } from '/service-worker-scripts/storage.js';
import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';

const storage = new Storage();
storage.initAsync();
const operationResolver = new OperationResolver(storage);

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    console.debug(message);
    switch (message.type) {
      case 'gestures':
        await operationResolver.resolveAsync(message.gestures);
        break;
      case 'updateStorage':
        await storage.initAsync();
        break;
      case 'getSettings':
        sendResponse(storage.getSettings());
        break;
    }
  }
);