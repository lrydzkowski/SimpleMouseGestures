export class DuplicateTabOperation {
  async doAsync() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    const tab = tabs.find((tab) => tab.active === true);
    if (!tab) {
      return;
    }

    await chrome.tabs.duplicate(tab.id);
  }
}
