class CanvasEventHandler {
  #canvas;
  #context;
  #position;
  #lineColor = '#000000';
  #lineWidth = 2;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d');
    this.#resetPosition();
    const thisRef = this;
    chrome.runtime.sendMessage({ type: Consts.messageTypes.getSettings }, function (response) {
      console.debug(response);
      thisRef.#lineColor = response?.lineColor ?? '#000000';
      thisRef.#lineWidth = response?.lineWidth ?? 2;
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
    this.#context.strokeStyle = this.#lineColor;
    this.#context.lineWidth = this.#lineWidth;
    this.#context.stroke();
    this.#context.closePath();
  }
}