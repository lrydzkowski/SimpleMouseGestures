import { StorageKeys } from '../shared/storage-keys';
import type { GestureMap, Settings } from '../shared/types';

export class Storage {
  #initMap: GestureMap = {
    left: 'goBack',
    right: 'goForward',
    up: 'openNewTab',
    down: 'closeCurrentTab',
    'up|down': 'reloadCurrentTab',
    'up|left': 'switchToLeftTab',
    'up|right': 'switchToRightTab',
    'left|down|right': 'closeWindow',
    'down|left': 'minimizeWindow',
    'left|up': 'scrollToTop',
    'left|down': 'scrollToBottom',
  };
  #map?: GestureMap;

  #initSettings: Settings = {
    lineColor: '#000000',
    lineWidth: 2,
  };
  #settings?: Settings;

  async initAsync() {
    await this.#initMapAsync();
    await this.#initSettingsAsync();
  }

  getOperationKey(gestures: string) {
    if (!this.#map?.hasOwnProperty(gestures)) {
      return;
    }

    return this.#map[gestures];
  }

  async #initMapAsync() {
    const map = await this.#getFromStorageAsync<GestureMap>(StorageKeys.data);
    if (map !== undefined) {
      this.#map = map;

      return;
    }

    this.#map = this.#initMap;
    await this.#saveInStorageAsync(StorageKeys.data, this.#map);
  }

  async #initSettingsAsync() {
    const settings = await this.#getFromStorageAsync<Settings>(StorageKeys.settings);
    if (settings !== undefined) {
      this.#settings = settings;

      return;
    }

    this.#settings = this.#initSettings;
    await this.#saveInStorageAsync(StorageKeys.settings, this.#settings);
  }

  async #getFromStorageAsync<T>(storageKey: string): Promise<T | undefined> {
    const value = await chrome.storage.local.get([storageKey]);
    const rawValue = value[storageKey];
    if (typeof rawValue !== 'string') {
      return;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch (e) {
      console.error(e);
    }
  }

  async #saveInStorageAsync(storageKey: string, data: unknown) {
    const obj: Record<string, string> = {};
    obj[storageKey] = JSON.stringify(data);
    await chrome.storage.local.set(obj);
  }
}
