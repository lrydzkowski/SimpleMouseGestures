import type { Direction } from '../shared/types';

export class Context {
  gestures: Direction[] = [];
  selectedText = '';
  linkUrl = '';

  constructor(gestures: Direction[], selectedText: string, linkUrl: string) {
    this.gestures = gestures;
    this.selectedText = selectedText;
    this.linkUrl = linkUrl;
  }
}
