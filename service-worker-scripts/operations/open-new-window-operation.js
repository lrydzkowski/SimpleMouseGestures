export class OpenNewWindowOperation {
  async doAsync() {
    chrome.windows.create();
  }
}
