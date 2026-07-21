import { Context } from '../context';
import { Operation } from '../operation';

export class OpenNewTabOperation implements Operation {
  #openLink = false;

  constructor(openLink: boolean) {
    this.#openLink = openLink ?? false;
  }

  async doAsync(context: Context) {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    const activeTabIndex = tabs.findIndex((tab) => tab.active === true);
    if (activeTabIndex === -1) {
      return;
    }

    const createProperties: chrome.tabs.CreateProperties = { active: true, index: activeTabIndex + 1 };
    const linkUrl = this.#getLinkUrl(context);
    if (linkUrl.length > 0) {
      createProperties.url = linkUrl;
    }

    await chrome.tabs.create(createProperties);
  }

  #getLinkUrl(context: Context) {
    if (!this.#openLink) {
      return '';
    }

    return context?.linkUrl?.trim() ?? '';
  }
}
