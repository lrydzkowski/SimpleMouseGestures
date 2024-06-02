export class SwitchToRightTabOperation {
  async doAsync() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    if (tabs.length === 1) {
      return;
    }

    const activeTabIndex = tabs.findIndex((tab) => tab.active === true);
    if (activeTabIndex === -1) {
      return;
    }

    const prevTabIndex = activeTabIndex === tabs.length - 1 ? 0 : activeTabIndex + 1;
    const prevTab = tabs[prevTabIndex];

    chrome.tabs.update(prevTab.id, { active: true, highlighted: true });
  }
}
