export class Storage {
  #mapStorageKey = 'simpleMouseGesturesData';
  #initMap = {
    'left': 'goBack',
    'right': 'goForward',
    'up': 'openNewTab',
    'down': 'closeCurrentTab',
    'up|down': 'reloadCurrentTab',
    'up|left': 'switchToLeftTab',
    'up|right': 'switchToRightTab',
    'left|down|right': 'closeWindow',
    'down|left': 'minimizeWindow',
    'left|up': 'scrollToTop',
    'left|down': 'scrollToBottom'
  };
  #map;

  #settingsStorageKey = 'simpleMouseGesturesSettings';
  #initSettings = {
    'lineColor': '#000000',
    'lineWidth': 2
  };
  #settings;

  async initAsync() {
    await this.#initMapAsync();
    await this.#initSettingsAsync();
  }

  getOperationKey(gestures) {
    if (!this.#map?.hasOwnProperty(gestures)) {
      return;
    }

    return this.#map[gestures];
  }

  getSettings() {
    return this.#settings;
  }

  async #initMapAsync() {
    console.log('initMapAsync');
    const map = await this.#getFromStorageAsync(this.#mapStorageKey);
    if (map !== undefined) {
      this.#map = map;

      return;
    }

    this.#map = this.#initMap;
    await this.#saveInStorageAsync(this.#mapStorageKey, this.#map);
  }

  async #initSettingsAsync() {
    const settings = await this.#getFromStorageAsync(this.#settingsStorageKey);
    if (settings !== undefined) {
      this.#settings = settings;

      return;
    }

    this.#settings = this.#initSettings;
    await this.#saveInStorageAsync(this.#settingsStorageKey, this.#settings);
  }

  async #getFromStorageAsync(storageKey) {
    const value = await chrome.storage.local.get([storageKey]);
    console.log('getFromStorage');
    console.debug(value);
    if (!value.hasOwnProperty(storageKey)) {
      return;
    }

    try {
      return JSON.parse(value[storageKey]);
    } catch (e) {
      console.error(e);
    }
  }

  async #saveInStorageAsync(storageKey, data) {
    const obj = {};
    obj[storageKey] = JSON.stringify(data);
    console.log(obj);
    await chrome.storage.local.set(obj);
  }
}
