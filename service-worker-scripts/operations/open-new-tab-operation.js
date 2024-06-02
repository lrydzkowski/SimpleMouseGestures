export class OpenNewTabOperation {
  async doAsync() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    const activeTabIndex = tabs.findIndex((tab) => tab.active === true);
    if (activeTabIndex === -1) {
      return;
    }

    chrome.tabs.create({ active: true, index: activeTabIndex + 1 });
  }
}
