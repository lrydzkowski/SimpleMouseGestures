export class ScrollToBottomOperation {
  async doAsync() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    tab?.id && await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        window.scrollTo(0, document.body.scrollHeight);
      }
    }) 
  }
}
