export class Storage {
  #mapStorageKey = 'simpleMouseGesturesData';
  #settingsStorageKey = 'simpleMouseGesturesSettings';

  async getAllGesturesAsync() {
    const map = await this.#getFromStorageAsync(this.#mapStorageKey);

    return { ...map };
  }

  async gestureExistsAsync(gestures) {
    const map = await this.#getFromStorageAsync(this.#mapStorageKey);

    return map.hasOwnProperty(gestures);
  }

  async saveGesturesAsync(gestures, operationKey) {
    const map = await this.#getFromStorageAsync(this.#mapStorageKey);
    map[gestures] = operationKey;
    await this.#saveMapInStorageAsync(map);
  }

  async deleteGesturesAsync(gestures) {
    const map = await this.#getFromStorageAsync(this.#mapStorageKey);
    if (!map?.hasOwnProperty(gestures)) {
      return;
    }

    delete map[gestures];
    await this.#saveMapInStorageAsync(map);
  }

  async getSettingsAsync() {
    const settings = await this.#getFromStorageAsync(this.#settingsStorageKey);

    return { ...settings };
  }

  async saveSettingsAsync(settings) {
    await this.#saveInStorageAsync(this.#settingsStorageKey, settings);
    chrome.runtime.sendMessage({ type: 'updateStorage' });
  }

  async #saveMapInStorageAsync(map) {
    await this.#saveInStorageAsync(this.#mapStorageKey, map);
    chrome.runtime.sendMessage({ type: 'updateStorage' });
  }

  async #getFromStorageAsync(storageKey) {
    const value = await chrome.storage.local.get([storageKey]);
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
    await chrome.storage.local.set(obj);
  }
}
