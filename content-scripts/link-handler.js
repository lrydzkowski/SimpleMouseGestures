class LinkHandler {
  #link = '';

  saveLink(event) {
    this.#link = '';
    const anchor = this.#findAnchor(event);
    if (anchor === undefined) {
      return;
    }

    const url = this.#parseUrl(anchor.href);
    if (url === undefined) {
      return;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return;
    }

    this.#link = url.href;
  }

  getLink() {
    return this.#link;
  }

  #findAnchor(event) {
    return event.composedPath().find((element) => this.#isAnchorWithHref(element));
  }

  #isAnchorWithHref(element) {
    return element instanceof HTMLAnchorElement && element.hasAttribute('href');
  }

  #parseUrl(href) {
    try {
      return new URL(href);
    } catch (e) {
      return undefined;
    }
  }
}
