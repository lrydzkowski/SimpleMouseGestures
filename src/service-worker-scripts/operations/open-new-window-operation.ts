import { Operation } from '../operation';

export class OpenNewWindowOperation implements Operation {
  async doAsync() {
    const currentWindow = await chrome.windows.getCurrent();
    await chrome.windows.create({ state: currentWindow.state });
  }
}
