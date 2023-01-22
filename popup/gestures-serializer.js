export class GesturesSerializer {
  serialize(gestures) {
    return gestures.split('|').map(gesture => gesture[0]).join('').toUpperCase();
  }

  deserialize(serializedGestures) {
    const gestures = [];
    for (const letter of serializedGestures.toLowerCase()) {
      switch (letter) {
        case 'u':
          gestures.push(Consts.direction.up);
          break;
        case 'r':
          gestures.push(Consts.direction.right);
          break;
        case 'd':
          gestures.push(Consts.direction.down);
          break;
        case 'l':
          gestures.push(Consts.direction.left);
          break;
      }
    }

    return gestures.join('|');
  }
}