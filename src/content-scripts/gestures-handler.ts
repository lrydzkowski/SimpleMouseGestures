import { Consts } from '../shared/consts';
import type { Direction } from '../shared/types';

interface Point {
  x: number;
  y: number;
}

interface Position {
  prev: Point;
  curr: Point;
}

export class GesturesHandler {
  #gestures!: Direction[];
  #position!: Position;
  #recordingStarted!: boolean;

  #mousemoveHandler: (event: MouseEvent) => void;
  #startRecordingGestureHandler?: () => void;

  constructor() {
    this.#mousemoveHandler = this.#createMousemoveHandler();
    this.#reset();
  }

  initPosition(event: MouseEvent) {
    this.#reset();
    this.#position.curr.x = event.clientX;
    this.#position.curr.y = event.clientY;
    this.#registerEvent();
  }

  addStartRecordingGestureEventHandler(startRecordingGestureHandler: () => void) {
    this.#startRecordingGestureHandler = startRecordingGestureHandler;
  }

  getGestures() {
    this.#unregisterEvent();

    return this.#gestures;
  }

  cancel() {
    this.#unregisterEvent();
    this.#reset();
  }

  #registerEvent() {
    addEventListener('mousemove', this.#mousemoveHandler);
  }

  #unregisterEvent() {
    removeEventListener('mousemove', this.#mousemoveHandler);
  }

  #createMousemoveHandler() {
    return (event: MouseEvent) => {
      this.#handleMousemoveEvent(event);
    };
  }

  #handleMousemoveEvent(event: MouseEvent) {
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

  #recordGesture(event: MouseEvent) {
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
      return;
    }

    if (this.#canTriggerStartRecordingGestureEvent()) {
      this.#recordingStarted = true;
      this.#startRecordingGestureHandler?.();
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

  #isPositionsDifferenceEnough(prevPosition: Point, currPosition: Point) {
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

  #isUp(angle: number) {
    if (angle >= 45 && angle < 135) {
      return true;
    }

    return false;
  }

  #isRight(angle: number) {
    if (angle >= 135 && angle < 225) {
      return true;
    }

    return false;
  }

  #isDown(angle: number) {
    if (angle >= 225 && angle < 315) {
      return true;
    }

    return false;
  }

  #isLeft(angle: number) {
    if (angle >= 315 || angle < 45) {
      return true;
    }

    return false;
  }

  #addGesture(gesture: Direction) {
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
