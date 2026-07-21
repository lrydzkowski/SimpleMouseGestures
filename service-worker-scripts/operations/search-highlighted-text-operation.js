export class SearchHighlightedTextOperation {
  #active = false;

  constructor(active) {
    this.#active = active ?? false;
  }

  async doAsync(context) {
    const selectedText = context?.selectedText?.trim() ?? '';
    if (selectedText?.length > 0) {
      try {
        const query = encodeURIComponent(selectedText);
        await chrome.tabs.create({ url: `https://www.google.com/search?q=${query}`, active: this.#active });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
