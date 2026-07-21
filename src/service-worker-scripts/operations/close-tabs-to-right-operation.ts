import { Operation } from '../operation';

export class CloseTabsToRightOperation implements Operation {
  async doAsync() {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab?.id) {
      return;
    }

    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const tabsToClose = allTabs
      .filter((tab) => tab.index > currentTab.index)
      .map((tab) => tab.id)
      .filter((tabId): tabId is number => tabId !== undefined);

    if (tabsToClose.length > 0) {
      await chrome.tabs.remove(tabsToClose);
    }
  }
}
