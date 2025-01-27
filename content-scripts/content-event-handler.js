class ContentEventHandler {
  #gesturesHandler;
  #canvasHandler;
  #selectedTextHandler;

  #mouseDownHandler;
  #mouseUpHandler;
  #contextMenuHandler;

  #blockDefaultContextMenu = false;

  constructor(gesturesHandler, canvasHandler, selectedTextHandler) {
    this.#gesturesHandler = gesturesHandler;
    this.#canvasHandler = canvasHandler;
    this.#selectedTextHandler = selectedTextHandler;
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
      this.#handleMouseDown(event, this.#gesturesHandler, this.#selectedTextHandler);
    };
  }

  #handleMouseDown(event, gesturesHandler, selectedTextHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    selectedTextHandler.saveSelectedText();
    gesturesHandler.initPosition(event);
  }

  #createMouseUpHandler() {
    return (event) => {
      this.#handleMouseUp(event, this.#canvasHandler, this.#gesturesHandler, this.#selectedTextHandler);
    };
  }

  #handleMouseUp(event, canvasHandler, gesturesHandler, selectedTextHandler) {
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
      selectedText: selectedTextHandler.getSelectedText(),
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
