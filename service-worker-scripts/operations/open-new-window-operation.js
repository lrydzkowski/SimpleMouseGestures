export class OpenNewWindowOperation {
  async doAsync() {
    const currentWindow = await chrome.windows.getCurrent();
    chrome.windows.create({ state: currentWindow.state });
  }
}
