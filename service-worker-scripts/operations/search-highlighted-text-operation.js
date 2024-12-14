export class SearchHighlightedTextOperation {
  #active = false;

  constructor(active) {
    this.#active = active ?? false;
  }

  async doAsync(context) {
    const selectedText = context?.selectedText?.trim() ?? '';
    if (selectedText?.length > 0) {
      const query = encodeURIComponent(selectedText);
      chrome.tabs.create({ url: `https://www.google.com/search?q=${query}`, active: this.#active });
    }
  }
}