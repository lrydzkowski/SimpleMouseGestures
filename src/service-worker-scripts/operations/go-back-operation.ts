import { Operation } from '../operation';

export class GoBackOperation implements Operation {
  async doAsync() {
    await chrome.tabs.goBack();
  }
}
