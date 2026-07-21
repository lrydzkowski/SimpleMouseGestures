export class CloseTabsToRightOperation {
  async doAsync() {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab?.id) {
      return;
    }

    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const tabsToClose = allTabs.filter((tab) => tab.index > currentTab.index).map((tab) => tab.id);

    if (tabsToClose.length > 0) {
      try {
        await chrome.tabs.remove(tabsToClose);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
