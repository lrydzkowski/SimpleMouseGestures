import { Storage } from '/popup/storage.js';
import { GesturesSerializer } from '/popup/gestures-serializer.js';
import { BackupHandler } from '/popup/backup-handler.js';
import { PopupHandler } from '/popup/popup-handler.js';

const storage = new Storage();
const gesturesSerializer = new GesturesSerializer();
const backupHandler = new BackupHandler(storage);
const popupHandler = new PopupHandler(storage, gesturesSerializer, backupHandler);
await popupHandler.initAsync();
