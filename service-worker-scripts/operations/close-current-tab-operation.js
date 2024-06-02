export class CloseCurrentTabOperation {
  async doAsync() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    const activeTabIndex = tabs.findIndex((tab) => tab.active === true);
    if (activeTabIndex === -1) {
      return;
    }

    const tab = tabs[activeTabIndex];
    chrome.tabs.remove(tab.id);
  }
}
