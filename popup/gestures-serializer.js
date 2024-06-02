export class GesturesSerializer {
  serialize(gestures) {
    return gestures
      .split('|')
      .map((gesture) => gesture[0])
      .join('')
      .toUpperCase();
  }

  deserialize(serializedGestures) {
    const gestures = [];
    for (const letter of serializedGestures.toLowerCase()) {
      switch (letter) {
        case 'u':
          gestures.push(Consts.gesture.up);
          break;
        case 'r':
          gestures.push(Consts.gesture.right);
          break;
        case 'd':
          gestures.push(Consts.gesture.down);
          break;
        case 'l':
          gestures.push(Consts.gesture.left);
          break;
      }
    }

    return gestures.join('|');
  }
}
