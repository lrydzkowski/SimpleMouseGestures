export class Context {
  gestures = [];
  selectedText = '';

  constructor(gestures, selectedText) {
    this.gestures = gestures;
    this.selectedText = selectedText;
  }
}