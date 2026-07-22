export class LinkHandler {
  #link = '';

  saveLink(event: MouseEvent) {
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

  #findAnchor(event: MouseEvent) {
    return event.composedPath().find((element): element is HTMLAnchorElement => this.#isAnchorWithHref(element));
  }

  #isAnchorWithHref(element: EventTarget) {
    return element instanceof HTMLAnchorElement && element.hasAttribute('href');
  }

  #parseUrl(href: string) {
    try {
      return new URL(href);
    } catch (e) {
      return undefined;
    }
  }
}
