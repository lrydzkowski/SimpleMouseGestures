class GesturesHandler {
  #gestures;
  #position;
  #recordingStarted;

  #mousemoveHandler;
  #startRecordingGestureHandler;

  constructor() {
    this.#mousemoveHandler = this.#createMousemoveHandler();
    this.#reset();
  }

  initPosition(event) {
    this.#reset();
    this.#position.curr.x = event.clientX;
    this.#position.curr.y = event.clientY;
    this.#registerEvent();
  }

  addStartRecordingGestureEventHandler(startRecordingGestureHandler) {
    this.#startRecordingGestureHandler = startRecordingGestureHandler;
  }

  getGestures() {
    this.#unregisterEvent();

    return this.#gestures;
  }

  #registerEvent() {
    addEventListener('mousemove', this.#mousemoveHandler);
  }

  #unregisterEvent() {
    removeEventListener('mousemove', this.#mousemoveHandler);
  }

  #createMousemoveHandler() {
    return (event) => {
      this.#handleMousemoveEvent(event);
    };
  }

  #handleMousemoveEvent(event) {
    if (event.buttons !== Consts.rightButton) {
      return;
    }

    this.#recordGesture(event);
  }

  #reset() {
    this.#gestures = [];
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
    this.#recordingStarted = false;
  }

  #recordGesture(event) {
    if (
      !this.#isPositionsDifferenceEnough(this.#position.curr, {
        x: event.clientX,
        y: event.clientY,
      })
    ) {
      return;
    }

    this.#position.prev.x = this.#position.curr.x;
    this.#position.prev.y = this.#position.curr.y;
    this.#position.curr.x = event.clientX;
    this.#position.curr.y = event.clientY;

    if (this.#position.prev.x === -1 || this.#position.prev.y === -1) {
      return this.#position;
    }

    if (this.#canTriggerStartRecordingGestureEvent()) {
      this.#recordingStarted = true;
      this.#startRecordingGestureHandler();
    }

    let angle =
      (Math.atan2(this.#position.curr.y - this.#position.prev.y, this.#position.curr.x - this.#position.prev.x) * 180) /
        Math.PI +
      180;

    if (this.#isUp(angle)) {
      this.#addGesture(Consts.gesture.up);

      return;
    }

    if (this.#isRight(angle)) {
      this.#addGesture(Consts.gesture.right);

      return;
    }

    if (this.#isDown(angle)) {
      this.#addGesture(Consts.gesture.down);

      return;
    }

    if (this.#isLeft(angle)) {
      this.#addGesture(Consts.gesture.left);

      return;
    }
  }

  #isPositionsDifferenceEnough(prevPosition, currPosition) {
    if (Math.abs(prevPosition.x - currPosition.x) > 3) {
      return true;
    }

    if (Math.abs(prevPosition.y - currPosition.y) > 3) {
      return true;
    }

    return false;
  }

  #canTriggerStartRecordingGestureEvent() {
    return this.#recordingStarted === false && typeof this.#startRecordingGestureHandler === 'function';
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

  #addGesture(gesture) {
    if (this.#gestures.length === 0) {
      this.#gestures.push(gesture);

      return;
    }

    if (this.#gestures[this.#gestures.length - 1] === gesture) {
      return;
    }

    this.#gestures.push(gesture);
  }
}
