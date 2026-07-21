import { Operation } from '../operation';

export class ReloadCurrentTabOperation implements Operation {
  async doAsync() {
    await chrome.tabs.reload();
  }
}
