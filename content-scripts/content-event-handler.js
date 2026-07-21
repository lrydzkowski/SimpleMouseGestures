class ContentEventHandler {
  static #armedContextMenuWindowMs = 500;

  #gesturesHandler;
  #canvasHandler;
  #selectedTextHandler;
  #linkHandler;
  #contextMenuOnPress;

  #mouseDownHandler;
  #mouseUpHandler;
  #contextMenuHandler;

  #blockDefaultContextMenu = false;
  #contextMenuArmedAt = null;

  constructor(gesturesHandler, canvasHandler, selectedTextHandler, linkHandler, contextMenuOnPress) {
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
    return (event) => {
      this.#handleMouseDown(event, this.#gesturesHandler, this.#selectedTextHandler, this.#linkHandler);
    };
  }

  #handleMouseDown(event, gesturesHandler, selectedTextHandler, linkHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    selectedTextHandler.saveSelectedText();
    linkHandler.saveLink(event);
    gesturesHandler.initPosition(event);
  }

  #createMouseUpHandler() {
    return (event) => {
      this.#handleMouseUp(
        event,
        this.#canvasHandler,
        this.#gesturesHandler,
        this.#selectedTextHandler,
        this.#linkHandler,
      );
    };
  }

  #handleMouseUp(event, canvasHandler, gesturesHandler, selectedTextHandler, linkHandler) {
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
    chrome.runtime.sendMessage({
      gestures,
      type: Consts.messageTypes.gestures,
      selectedText: selectedTextHandler.getSelectedText(),
      linkUrl: linkHandler.getLink(),
    });
  }

  #createContextMenuHandler() {
    return (event) => {
      this.#handleContextMenu(event);
    };
  }

  #handleContextMenu(event) {
    if (this.#contextMenuOnPress) {
      this.#handleContextMenuOnPress(event);

      return;
    }

    if (this.#blockDefaultContextMenu) {
      this.#blockDefaultContextMenu = false;
      event.preventDefault();
    }
  }

  #handleContextMenuOnPress(event) {
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
