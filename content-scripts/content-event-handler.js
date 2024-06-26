class ContentEventHandler {
  #gesturesHandler;
  #canvasHandler;

  #mouseDownHandler;
  #mouseUpHandler;
  #contextMenuHandler;

  #blockDefaultContextMenu = false;

  constructor(gesturesHandler, canvasHandler) {
    this.#gesturesHandler = gesturesHandler;
    this.#canvasHandler = canvasHandler;
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
    return (event) => {
      this.#handleMouseDown(event, this.#gesturesHandler);
    };
  }

  #handleMouseDown(event, gesturesHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    gesturesHandler.initPosition(event);
  }

  #createMouseUpHandler() {
    return (event) => {
      this.#handleMouseUp(event, this.#canvasHandler, this.#gesturesHandler);
    };
  }

  #handleMouseUp(event, canvasHandler, gesturesHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    canvasHandler.removeFromDom();
    const gestures = gesturesHandler.getGestures();
    if (gestures.length === 0) {
      return;
    }

    if (chrome.runtime?.id === undefined) {
      console.debug('Chrome runtime id is undefined');

      return;
    }

    this.#blockDefaultContextMenu = true;
    chrome.runtime.sendMessage({
      gestures,
      type: Consts.messageTypes.gestures,
    });
  }

  #createContextMenuHandler() {
    return (event) => {
      this.#handleContextMenu(event);
    };
  }

  #handleContextMenu(event) {
    if (this.#blockDefaultContextMenu) {
      this.#blockDefaultContextMenu = false;
      event.preventDefault();
    }
  }
}
