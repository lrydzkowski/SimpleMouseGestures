import { Storage } from '/service-worker-scripts/storage.js';
import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';
import { PopupHandler } from '/popup/popup-handler.js';
import { GesturesSerializer } from '/popup/gestures-serializer.js';

const storage = new Storage();
const operationResolver = new OperationResolver(storage);
const gesturesSerializer = new GesturesSerializer();
const popupHandler = new PopupHandler(operationResolver, storage, gesturesSerializer);
popupHandler.registerEvents();
await popupHandler.restoreListAsync();
