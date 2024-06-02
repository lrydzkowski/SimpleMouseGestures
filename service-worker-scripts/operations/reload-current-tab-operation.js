export class ReloadCurrentTabOperation {
  async doAsync() {
    await chrome.tabs.reload();
  }
}
