import { defineBackground } from 'wxt/utils/define-background';
import { Storage } from '../service-worker-scripts/storage';
import { Context } from '../service-worker-scripts/context';
import { OperationResolver } from '../service-worker-scripts/operation-resolver';
import type { Message } from '../shared/types';

export default defineBackground({
  type: 'module',
  main() {
    const storage = new Storage();
    storage.initAsync();
    const operationResolver = new OperationResolver(storage);

    chrome.runtime.onMessage.addListener(async function (message: Message) {
      switch (message.type) {
        case 'gestures':
          const context = new Context(message.gestures, message.selectedText, message.linkUrl);
          await operationResolver.resolveAsync(context);
          break;
        case 'updateStorage':
          await storage.initAsync();
          break;
      }
    });
  },
});
