export class OpenNewWindowOperation {
  async doAsync() {
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = '';
    if (currentTab?.length > 0 && currentTab[0].url) {
      url = currentTab[0].url;
    }

    chrome.windows.create({ url, state: 'maximized' });
  }
}
