class CanvasBuilder {
  #canvas;

  build() {
    if (this.#canvas === undefined) {
      this.#canvas = this.#createCanvas();
    }

    return this.#canvas;
  }

  #createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    (canvas.style.top = '0'), (canvas.style.left = '0');
    canvas.style.background = 'transparent';
    canvas.style.zIndex = '2147483647';

    return canvas;
  }
}
