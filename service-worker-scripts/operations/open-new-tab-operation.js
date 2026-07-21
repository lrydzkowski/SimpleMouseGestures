export class OpenNewTabOperation {
  #openLink = false;

  constructor(openLink) {
    this.#openLink = openLink ?? false;
  }

  async doAsync(context) {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!Array.isArray(tabs)) {
      return;
    }

    const activeTabIndex = tabs.findIndex((tab) => tab.active === true);
    if (activeTabIndex === -1) {
      return;
    }

    const createProperties = { active: true, index: activeTabIndex + 1 };
    const linkUrl = this.#getLinkUrl(context);
    if (linkUrl.length > 0) {
      createProperties.url = linkUrl;
    }

    try {
      await chrome.tabs.create(createProperties);
    } catch (error) {
      console.error(error);
    }
  }

  #getLinkUrl(context) {
    if (!this.#openLink) {
      return '';
    }

    return context?.linkUrl?.trim() ?? '';
  }
}
