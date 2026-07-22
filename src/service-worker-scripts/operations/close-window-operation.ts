import { Operation } from '../operation';

export class CloseWindowOperation implements Operation {
  async doAsync() {
    const currentWindow = await chrome.windows.getCurrent();
    if (currentWindow.id === undefined) {
      return;
    }

    await chrome.windows.remove(currentWindow.id);
  }
}
