class SettingsStorage {
  #settingsStorageKey = 'simpleMouseGesturesSettings';

  async getSettingsAsync() {
    const settings = await this.#getFromStorageAsync(this.#settingsStorageKey);

    return { ...settings };
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
}
