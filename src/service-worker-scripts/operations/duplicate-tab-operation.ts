import { Operation } from '../operation';

export class DuplicateTabOperation implements Operation {
  async doAsync() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    const tab = tabs.find((tab) => tab.active === true);
    if (!tab || tab.id === undefined) {
      return;
    }

    await chrome.tabs.duplicate(tab.id);
  }
}
