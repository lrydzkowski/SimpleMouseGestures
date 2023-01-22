export class MinimizeWindowOperation {
  async doAsync() {
    const currentWindow = await chrome.windows.getCurrent();
    chrome.windows.update(
      currentWindow.id,
      {
        state: 'minimized'
      }
    );
  }
}