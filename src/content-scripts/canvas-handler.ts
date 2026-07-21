import { CanvasEventHandler } from './canvas-event-handler';

export class CanvasHandler {
  #canvasEventHandler: CanvasEventHandler;
  #canvas: HTMLCanvasElement;

  constructor(canvasEventHandler: CanvasEventHandler, canvas: HTMLCanvasElement) {
    this.#canvasEventHandler = canvasEventHandler;
    this.#canvas = canvas;
  }

  addToDom() {
    this.#canvasEventHandler.reset();
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    document.body.append(this.#canvas);
  }

  removeFromDom() {
    this.#canvas.remove();
  }
}
