import { Consts } from '../shared/consts';
import { SettingsStorage } from './settings-storage';

interface Point {
  x: number;
  y: number;
}

interface Position {
  prev: Point;
  curr: Point;
}

export class CanvasEventHandler {
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D | null;
  #position!: Position;
  #lineColor: string = '#000000';
  #lineWidth: number | string = 2;

  constructor(canvas: HTMLCanvasElement, storage: SettingsStorage) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d');
    this.#resetPosition();
    storage.getSettingsAsync().then((settings) => {
      this.#lineColor = settings?.lineColor ?? '#000000';
      this.#lineWidth = settings?.lineWidth ?? 2;
    });
  }

  registerEvent() {
    this.#canvas.addEventListener('mousemove', (event) => {
      if (event.buttons !== Consts.rightButton) {
        return;
      }

      this.#handleDrawing(event);
    });
  }

  reset() {
    if (this.#context === null) {
      return;
    }

    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#resetPosition();
  }

  #resetPosition() {
    this.#position = {
      prev: {
        x: -1,
        y: -1,
      },
      curr: {
        x: -1,
        y: -1,
      },
    };
  }

  #handleDrawing(event: MouseEvent) {
    this.#position.prev.x = this.#position.curr.x;
    this.#position.prev.y = this.#position.curr.y;
    this.#position.curr.x = event.clientX - this.#canvas.offsetLeft;
    this.#position.curr.y = event.clientY - this.#canvas.offsetTop;
    this.#draw();
  }

  #draw() {
    if (this.#context === null) {
      return;
    }

    if (this.#position.prev.x === -1 || this.#position.prev.y === -1) {
      return;
    }

    this.#context.beginPath();
    this.#context.moveTo(this.#position.prev.x, this.#position.prev.y);
    this.#context.lineTo(this.#position.curr.x, this.#position.curr.y);
    this.#context.strokeStyle = this.#lineColor;
    this.#context.lineWidth = Number(this.#lineWidth);
    this.#context.stroke();
    this.#context.closePath();
  }
}
