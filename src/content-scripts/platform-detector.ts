interface NavigatorWithUAData extends Navigator {
  userAgentData?: {
    platform?: string;
  };
}

export class PlatformDetector {
  static #contextMenuOnPressPlatformTokens = ['mac', 'linux'];

  isContextMenuOnPress() {
    const platformName = this.#getPlatformName().toLowerCase();

    return PlatformDetector.#contextMenuOnPressPlatformTokens.some((token) => platformName.includes(token));
  }

  #getPlatformName() {
    const navigatorWithUAData = navigator as NavigatorWithUAData;
    if (navigatorWithUAData.userAgentData?.platform) {
      return navigatorWithUAData.userAgentData.platform;
    }

    return navigator.platform ?? '';
  }
}
