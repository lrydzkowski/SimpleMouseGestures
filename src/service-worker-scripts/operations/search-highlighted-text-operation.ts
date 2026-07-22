import { Context } from '../context';
import { Operation } from '../operation';

export class SearchHighlightedTextOperation implements Operation {
  #active = false;

  constructor(active: boolean) {
    this.#active = active ?? false;
  }

  async doAsync(context: Context) {
    const selectedText = context?.selectedText?.trim() ?? '';
    if (selectedText?.length > 0) {
      const query = encodeURIComponent(selectedText);
      await chrome.tabs.create({ url: `https://www.google.com/search?q=${query}`, active: this.#active });
    }
  }
}
