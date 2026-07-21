import { Operation } from '../operation';

export class GoForwardOperation implements Operation {
  async doAsync() {
    await chrome.tabs.goForward();
  }
}
