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
    if (this.#map !== undefined) {
      return;
    }

    const map = await this.#getFromStorageAsync();
    if (map !== undefined) {
      this.#map = map;

      return;
    }

    this.#map = this.#initMap;
    await this.#saveInStorageAsync(this.#map);
  }

  get(directions) {
    if (!this.#map.hasOwnProperty(directions)) {
      return;
    }

    return this.#map[directions];
  }

  async getAllAsync() {
    await this.initAsync();

    return { ...this.#map };
  }

  async saveAsync(directions, operationKey) {
    this.#map[directions] = operationKey;
    await this.#saveInStorageAsync(this.#map);
  }

  directionExists(directions) {
    return this.#map.hasOwnProperty(directions);
  }

  operationKeyExists(operationKey) {
    for (const directions in this.#map) {
      if (Object.hasOwnProperty.call(this.#map, directions)) {
        const operationKeyInMap = this.#map[directions];
        if (operationKeyInMap === operationKey) {
          return true;
        }
      }
    }

    return false;
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