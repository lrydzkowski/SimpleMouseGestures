export class ReloadCurrentTabOperation {
  do() {
    chrome.tabs.reload();
  }
}