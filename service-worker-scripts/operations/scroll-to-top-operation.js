export class ScrollToTopOperation {
  async doAsync() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    tab?.id && await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.scrollTo(0, 0);
      }
    }) 
  }
}
