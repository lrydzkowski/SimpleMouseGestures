import { Operation } from '../operation';

export class SwitchToLeftTabOperation implements Operation {
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

    const prevTabIndex = activeTabIndex === 0 ? tabs.length - 1 : activeTabIndex - 1;
    const prevTab = tabs[prevTabIndex];
    if (prevTab.id === undefined) {
      return;
    }

    await chrome.tabs.update(prevTab.id, { active: true, highlighted: true });
  }
}
