import '@melloware/coloris/dist/coloris.css';
import Coloris from '@melloware/coloris';
import { Storage } from './storage';
import { GesturesSerializer } from './gestures-serializer';
import { GestureInputSanitizer } from './gesture-input-sanitizer';
import { BackupHandler } from './backup-handler';
import { PopupHandler } from './popup-handler';

Coloris.init();

const storage = new Storage();
const gesturesSerializer = new GesturesSerializer();
const gestureInputSanitizer = new GestureInputSanitizer();
const backupHandler = new BackupHandler(storage);
const popupHandler = new PopupHandler(storage, gesturesSerializer, gestureInputSanitizer, backupHandler);
await popupHandler.initAsync();
