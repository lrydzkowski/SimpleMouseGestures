class DirectionsHandler {
  #directions;
  #position;

  constructor() {
    this.#reset();
  }

  initPosition(event) {
    this.#reset();
    this.#position.curr.x = event.clientX;
    this.#position.curr.y = event.clientY;
  }

  registerEvent() {
    addEventListener('mousemove', (event) => {
      if (event.buttons !== Consts.rightButton) {
        return;
      }

      this.#recordDirection(event);
    });
  }

  getDirections() {
    return this.#directions;
  }

  #reset() {
    this.#directions = [];
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

  #recordDirection(event) {
    this.#position.prev.x = this.#position.curr.x;
    this.#position.prev.y = this.#position.curr.y;
    this.#position.curr.x = event.clientX;
    this.#position.curr.y = event.clientY;

    if (this.#position.prev.x === -1 || this.#position.prev.y === -1) {
      return this.#position;
    }
    
    if (this.#areTheSame(this.#position)) {
      return;
    }

    let angle = Math.atan2(
      this.#position.curr.y - this.#position.prev.y,
      this.#position.curr.x - this.#position.prev.x) * 180 / Math.PI + 180;

    if (this.#isUp(angle)) {
      this.#addDirection(Consts.direction.up);
      
      return;
    }

    if (this.#isRight(angle)) {
      this.#addDirection(Consts.direction.right);

      return;
    }

    if (this.#isDown(angle)) {
      this.#addDirection(Consts.direction.down);

      return;
    }

    if (this.#isLeft(angle)) {
      this.#addDirection(Consts.direction.left);

      return;
    }
  }

  #areTheSame(position) {
    if (position.prev.x === position.curr.x && position.prev.y === position.curr.y) {
      return true;
    }

    return false;
  }

  #isUp(angle) {
    if (angle >= 45 && angle < 135) {
      return true;
    }

    return false;
  }

  #isRight(angle) {
    if (angle >= 135 && angle < 225) {
      return true;
    }

    return false;
  }

  #isDown(angle) {
    if (angle >= 225 && angle < 315) {
      return true;
    }

    return false;
  }

  #isLeft(angle) {
    if (angle >= 315 || angle < 45) {
      return true;
    }

    return false;
  }

  #addDirection(direction) {
    if (this.#directions.length === 0) {
      this.#directions.push(direction);

      return;
    }

    if (this.#directions[this.#directions.length - 1] === direction) {
      return;
    }

    this.#directions.push(direction);
  }
}
