export class GoForwardOperation {
  async doAsync() {
    try {
      await chrome.tabs.goForward();
    } catch (error) {
      console.error(error);
    }
  }
}
