import { Storage } from '/service-worker-scripts/storage.js';
import { Context } from '/service-worker-scripts/context.js';
import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';

const storage = new Storage();
storage.initAsync();
const operationResolver = new OperationResolver(storage);

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  switch (message.type) {
    case 'gestures':
      const context = new Context(message.gestures, message.selectedText);
      await operationResolver.resolveAsync(context);
      break;
    case 'updateStorage':
      await storage.initAsync();
      break;
  }
});
