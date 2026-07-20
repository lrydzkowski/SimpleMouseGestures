class PlatformDetector {
  static #contextMenuOnPressPlatformTokens = ['mac', 'linux'];

  isContextMenuOnPress() {
    const platformName = this.#getPlatformName().toLowerCase();

    return PlatformDetector.#contextMenuOnPressPlatformTokens.some((token) => platformName.includes(token));
  }

  #getPlatformName() {
    if (navigator.userAgentData?.platform) {
      return navigator.userAgentData.platform;
    }

    return navigator.platform ?? '';
  }
}
