export class Storage {
  #storageKey = 'simpleMouseGesturesData';

  async getAllAsync() {
    const map = await this.#getFromStorageAsync();

    return { ...map };
  }

  async gestureExistsAsync(gestures) {
    const map = await this.#getFromStorageAsync();

    return map.hasOwnProperty(gestures);
  }

  async saveAsync(gestures, operationKey) {
    const map = await this.#getFromStorageAsync();
    map[gestures] = operationKey;
    await this.#saveInStorageAsync(map);
  }

  async deleteAsync(gestures) {
    const map = await this.#getFromStorageAsync();
    if (!map?.hasOwnProperty(gestures)) {
      return;
    }

    delete map[gestures];
    await this.#saveInStorageAsync(map);
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
    chrome.runtime.sendMessage({ type: 'updateStorage' });
  }
}