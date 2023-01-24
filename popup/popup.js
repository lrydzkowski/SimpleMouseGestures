import { Storage } from '/popup/storage.js';
import { GesturesSerializer } from '/popup/gestures-serializer.js';
import { PopupHandler } from '/popup/popup-handler.js';

const storage = new Storage();
const gesturesSerializer = new GesturesSerializer();
const popupHandler = new PopupHandler(storage, gesturesSerializer);
popupHandler.registerEvents();
await popupHandler.restoreListAsync();
