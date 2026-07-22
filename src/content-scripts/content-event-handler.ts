import { Consts } from '../shared/consts';
import type { GesturesMessage } from '../shared/types';
import { GesturesHandler } from './gestures-handler';
import { CanvasHandler } from './canvas-handler';
import { SelectedTextHandler } from './selected-text-handler';
import { LinkHandler } from './link-handler';

export class ContentEventHandler {
  static #armedContextMenuWindowMs = 500;

  #gesturesHandler: GesturesHandler;
  #canvasHandler: CanvasHandler;
  #selectedTextHandler: SelectedTextHandler;
  #linkHandler: LinkHandler;
  #contextMenuOnPress: boolean;

  #mouseDownHandler: (event: MouseEvent) => void;
  #mouseUpHandler: (event: MouseEvent) => void;
  #contextMenuHandler: (event: MouseEvent) => void;

  #blockDefaultContextMenu = false;
  #contextMenuArmedAt: number | null = null;

  constructor(
    gesturesHandler: GesturesHandler,
    canvasHandler: CanvasHandler,
    selectedTextHandler: SelectedTextHandler,
    linkHandler: LinkHandler,
    contextMenuOnPress: boolean,
  ) {
    this.#gesturesHandler = gesturesHandler;
    this.#canvasHandler = canvasHandler;
    this.#selectedTextHandler = selectedTextHandler;
    this.#linkHandler = linkHandler;
    this.#contextMenuOnPress = contextMenuOnPress;
    this.#mouseDownHandler = this.#createMouseDownHandler();
    this.#mouseUpHandler = this.#createMouseUpHandler();
    this.#contextMenuHandler = this.#createContextMenuHandler();
    this.#gesturesHandler.addStartRecordingGestureEventHandler(() => this.#canvasHandler.addToDom());
  }

  registerEvents() {
    addEventListener('mousedown', this.#mouseDownHandler);
    addEventListener('mouseup', this.#mouseUpHandler);
    addEventListener('contextmenu', this.#contextMenuHandler);
  }

  #createMouseDownHandler() {
    return (event: MouseEvent) => {
      this.#handleMouseDown(event, this.#gesturesHandler, this.#selectedTextHandler, this.#linkHandler);
    };
  }

  #handleMouseDown(
    event: MouseEvent,
    gesturesHandler: GesturesHandler,
    selectedTextHandler: SelectedTextHandler,
    linkHandler: LinkHandler,
  ) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    selectedTextHandler.saveSelectedText();
    linkHandler.saveLink(event);
    gesturesHandler.initPosition(event);
  }

  #createMouseUpHandler() {
    return (event: MouseEvent) => {
      this.#handleMouseUp(
        event,
        this.#canvasHandler,
        this.#gesturesHandler,
        this.#selectedTextHandler,
        this.#linkHandler,
      );
    };
  }

  #handleMouseUp(
    event: MouseEvent,
    canvasHandler: CanvasHandler,
    gesturesHandler: GesturesHandler,
    selectedTextHandler: SelectedTextHandler,
    linkHandler: LinkHandler,
  ) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    canvasHandler.removeFromDom();
    const gestures = gesturesHandler.getGestures();
    if (gestures.length === 0) {
      this.#armContextMenu();

      return;
    }

    if (chrome.runtime?.id === undefined) {
      console.debug('Chrome runtime id is undefined');

      return;
    }

    this.#blockNextDefaultContextMenu();
    const message: GesturesMessage = {
      gestures,
      type: Consts.messageTypes.gestures,
      selectedText: selectedTextHandler.getSelectedText(),
      linkUrl: linkHandler.getLink(),
    };
    chrome.runtime.sendMessage(message);
  }

  #createContextMenuHandler() {
    return (event: MouseEvent) => {
      this.#handleContextMenu(event);
    };
  }

  #handleContextMenu(event: MouseEvent) {
    if (this.#contextMenuOnPress) {
      this.#handleContextMenuOnPress(event);

      return;
    }

    if (this.#blockDefaultContextMenu) {
      this.#blockDefaultContextMenu = false;
      event.preventDefault();
    }
  }

  #handleContextMenuOnPress(event: MouseEvent) {
    if (this.#isContextMenuArmed()) {
      this.#contextMenuArmedAt = null;
      this.#gesturesHandler.cancel();

      return;
    }

    event.preventDefault();
  }

  #armContextMenu() {
    if (!this.#contextMenuOnPress) {
      return;
    }

    this.#contextMenuArmedAt = Date.now();
  }

  #blockNextDefaultContextMenu() {
    if (this.#contextMenuOnPress) {
      return;
    }

    this.#blockDefaultContextMenu = true;
  }

  #isContextMenuArmed() {
    if (this.#contextMenuArmedAt === null) {
      return false;
    }

    return Date.now() - this.#contextMenuArmedAt <= ContentEventHandler.#armedContextMenuWindowMs;
  }
}
