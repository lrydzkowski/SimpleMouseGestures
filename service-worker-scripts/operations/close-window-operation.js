export class CloseWindowOperation {
  async doAsync() {
    const currentWindow = await chrome.windows.getCurrent();
    chrome.windows.remove(currentWindow.id);
  }
}
