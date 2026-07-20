export class Context {
  gestures = [];
  selectedText = '';
  linkUrl = '';

  constructor(gestures, selectedText, linkUrl) {
    this.gestures = gestures;
    this.selectedText = selectedText;
    this.linkUrl = linkUrl;
  }
}
