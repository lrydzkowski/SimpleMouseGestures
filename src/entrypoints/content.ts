import { defineContentScript } from 'wxt/utils/define-content-script';
import { GesturesHandler } from '../content-scripts/gestures-handler';
import { CanvasBuilder } from '../content-scripts/canvas-builder';
import { CanvasEventHandler } from '../content-scripts/canvas-event-handler';
import { CanvasHandler } from '../content-scripts/canvas-handler';
import { SelectedTextHandler } from '../content-scripts/selected-text-handler';
import { LinkHandler } from '../content-scripts/link-handler';
import { SettingsStorage } from '../content-scripts/settings-storage';
import { PlatformDetector } from '../content-scripts/platform-detector';
import { ContentEventHandler } from '../content-scripts/content-event-handler';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  allFrames: true,
  main() {
    const gesturesHandler = new GesturesHandler();
    const canvasBuilder = new CanvasBuilder();
    const canvas = canvasBuilder.build();
    const storage = new SettingsStorage();
    const canvasEventHandler = new CanvasEventHandler(canvas, storage);
    canvasEventHandler.registerEvent();
    const canvasHandler = new CanvasHandler(canvasEventHandler, canvas);
    const selectedTextHandler = new SelectedTextHandler();
    const linkHandler = new LinkHandler();
    const platformDetector = new PlatformDetector();
    const contentEventHandler = new ContentEventHandler(
      gesturesHandler,
      canvasHandler,
      selectedTextHandler,
      linkHandler,
      platformDetector.isContextMenuOnPress(),
    );
    contentEventHandler.registerEvents();
  },
});
