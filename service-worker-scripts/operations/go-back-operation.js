export class GoBackOperation {
  async doAsync() {
    try {
      await chrome.tabs.goBack();
    } catch (error) {
      console.error(error);
    }
  }
}
