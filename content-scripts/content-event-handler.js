class ContentEventHandler {
  #directionsHandler;
  #canvasHandler;

  #mouseDownHandler;
  #mouseUpHandler;
  #contextMenuHandler;
  
  constructor(directionsHandler, canvasHandler) {
    this.#directionsHandler = directionsHandler;
    this.#canvasHandler = canvasHandler;
    this.#mouseDownHandler = this.#createMouseDownHandler();
    this.#mouseUpHandler = this.#createMouseUpHandler();
    this.#contextMenuHandler = this.#createContextMenuHandler();
  }

  registerEvents() {
    addEventListener('mousedown', this.#mouseDownHandler);
    addEventListener('mouseup', this.#mouseUpHandler);
    addEventListener('contextmenu', this.#contextMenuHandler);
  }

  #removeEvents() {
    removeEventListener('mousedown', this.#mouseDownHandler);
    removeEventListener('mouseup', this.#mouseUpHandler);
    removeEventListener('contextmenu', this.#contextMenuHandler);
  }

  #createMouseDownHandler() {
    return (event) => {
      this.#handleMouseDown(event, this.#directionsHandler, this.#canvasHandler);
    }
  }

  #handleMouseDown(event, directionsHandler, canvasHandler) {
    console.log('mousedown');
    if (event.button !== Consts.rightButton) {
      return;
    }

    directionsHandler.initPosition(event);
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
  }

  #createContextMenuHandler() {
    return (event) => {
      this.#handleContextMenu(event, this.#directionsHandler);
    }
  }

  #handleContextMenu(event, directionsHandler) {
    if (event.button !== Consts.rightButton) {
      return;
    }

    const directions = directionsHandler.getDirections();
    if (directions.length === 0) {
      return;
    }

    event.preventDefault();
    if (chrome.runtime?.id === undefined) {
      this.#removeEvents();

      return;
    }

    chrome.runtime.sendMessage({ directions });
  }
}