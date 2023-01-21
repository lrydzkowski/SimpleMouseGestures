class CanvasEventHandler {
  #canvas;
  #context;
  #position;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d');
    this.#resetPosition();
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
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#resetPosition();
  }

  #resetPosition() {
    this.#position = {
      prev: {
        x: -1,
        y: -1
      },
      curr: {
        x: -1,
        y: -1
      }
    };
  }

  #handleDrawing(event) {
    this.#position.prev.x = this.#position.curr.x;
    this.#position.prev.y = this.#position.curr.y;
    this.#position.curr.x = event.clientX - this.#canvas.offsetLeft;
    this.#position.curr.y = event.clientY - this.#canvas.offsetTop;
    this.#draw();
  }

  #draw() {
    if (this.#position.prev.x === -1 || this.#position.prev.y === -1) {
      return;
    }

    this.#context.beginPath();
    this.#context.moveTo(this.#position.prev.x, this.#position.prev.y);
    this.#context.lineTo(this.#position.curr.x, this.#position.curr.y);
    this.#context.strokeStyle = 'black';
    this.#context.lineWidth = 2;
    this.#context.stroke();
    this.#context.closePath();
  }
}