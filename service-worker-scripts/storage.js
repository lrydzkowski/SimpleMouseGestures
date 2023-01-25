export class Storage {
  #storageKey = 'simpleMouseGesturesData';
  #initMap = {
    'left': 'goBack',
    'right': 'goForward',
    'up': 'openNewTab',
    'down': 'closeCurrentTab',
    'up|down': 'reloadCurrentTab',
    'up|left': 'switchToLeftTab',
    'up|right': 'switchToRightTab',
    'left|down|right': 'closeWindow',
    'down|left': 'minimizeWindow'
  };
  #map;

  async initAsync() {
    const map = await this.#getFromStorageAsync();
    if (map !== undefined) {
      this.#map = map;

      return;
    }

    this.#map = this.#initMap;
    await this.#saveInStorageAsync(this.#map);
  }

  get(gestures) {
    if (!this.#map?.hasOwnProperty(gestures)) {
      return;
    }

    return this.#map[gestures];
  }

  async getAllAsync() {
    await this.initAsync();

    return { ...this.#map };
  }

  async saveAsync(gestures, operationKey) {
    this.#map[gestures] = operationKey;
    await this.#saveInStorageAsync(this.#map);
  }

  async deleteAsync(gestures) {
    if (!this.#map?.hasOwnProperty(gestures)) {
      return;
    }

    delete this.#map[gestures];
    await this.#saveInStorageAsync(this.#map);
  }

  gestureExists(gestures) {
    return this.#map.hasOwnProperty(gestures);
  }

  async #getFromStorageAsync() {
    const value = await chrome.storage.local.get([this.#storageKey]);
    if (!value.hasOwnProperty(this.#storageKey)) {
      return;
    }

    try {
      return JSON.parse(value[this.#storageKey]);
    } catch (e) {
      console.error(e);
    }
  }

  async #saveInStorageAsync(map) {
    const obj = {};
    obj[this.#storageKey] = JSON.stringify(map);
    await chrome.storage.local.set(obj);
  }
}