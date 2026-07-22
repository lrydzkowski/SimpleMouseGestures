import { Operation } from '../operation';

export class MinimizeWindowOperation implements Operation {
  async doAsync() {
    const currentWindow = await chrome.windows.getCurrent();
    if (currentWindow.id === undefined) {
      return;
    }

    await chrome.windows.update(currentWindow.id, {
      state: 'minimized',
    });
  }
}
