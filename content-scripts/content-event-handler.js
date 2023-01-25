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
  }

  registerEvents() {
    console.log('registerEvents');
    addEventListener('mousedown', this.#mouseDownHandler);
    addEventListener('mouseup', this.#mouseUpHandler);
    addEventListener('contextmenu', this.#contextMenuHandler);
  }

  #removeEvents() {
    console.log('removeEvents');
    removeEventListener('mousedown', this.#mouseDownHandler);
    removeEventListener('mouseup', this.#mouseUpHandler);
    removeEventListener('contextmenu', this.#contextMenuHandler);
  }

  #createMouseDownHandler() {
    return (event) => {
      this.#handleMouseDown(event, this.#gesturesHandler, this.#canvasHandler);
    }
  }

  #handleMouseDown(event, gesturesHandler, canvasHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    gesturesHandler.initPosition(event);
    canvasHandler.addToDom();
  }

  #createMouseUpHandler() {
    return (event) => {
      this.#handleMouseUp(event, this.#canvasHandler);
    }
  }

  #handleMouseUp(event, canvasHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    canvasHandler.removeFromDom();
    const gestures = gesturesHandler.getGestures();
    console.log(gestures);
    if (gestures.length === 0) {
      return;
    }

    if (chrome.runtime?.id === undefined) {
      this.#removeEvents();

      return;
    }

    this.#blockDefaultContextMenu = true;
    chrome.runtime.sendMessage({ gestures, type: Consts.messageTypes.gestures });
  }

  #createContextMenuHandler() {
    return (event) => {
      this.#handleContextMenu(event);
    }
  }

  #handleContextMenu(event) {
    if (this.#blockDefaultContextMenu) {
      this.#blockDefaultContextMenu = false;
      event.preventDefault();
    }
  }
}