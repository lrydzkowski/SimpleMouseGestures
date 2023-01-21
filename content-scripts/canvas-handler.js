class CanvasHandler {
  #canvasEventHandler;
  #canvas;

  constructor(canvasEventHandler, canvas) {
    this.#canvasEventHandler = canvasEventHandler;
    this.#canvas = canvas;
  }

  addToDom() {
    this.#canvasEventHandler.reset();
    document.querySelector('body').append(this.#canvas);
  }

  removeFromDom() {
    this.#canvas.remove();
  }
}