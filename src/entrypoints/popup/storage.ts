import { StorageKeys } from '../../shared/storage-keys';
import { Consts } from '../../shared/consts';
import type { GestureMap, Settings, UpdateStorageMessage } from '../../shared/types';

export class Storage {
  async getAllGesturesAsync(): Promise<GestureMap> {
    const map = await this.#getFromStorageAsync<GestureMap>(StorageKeys.data);

    return { ...map };
  }

  async gestureExistsAsync(gestures: string) {
    const map = await this.#getFromStorageAsync<GestureMap>(StorageKeys.data);

    return map !== undefined && map.hasOwnProperty(gestures);
  }

  async saveGesturesAsync(gestures: string, operationKey: string) {
    const map = (await this.#getFromStorageAsync<GestureMap>(StorageKeys.data)) ?? {};
    map[gestures] = operationKey;
    await this.#saveMapInStorageAsync(map);
  }

  async deleteGesturesAsync(gestures: string) {
    const map = await this.#getFromStorageAsync<GestureMap>(StorageKeys.data);
    if (!map?.hasOwnProperty(gestures)) {
      return;
    }

    delete map[gestures];
    await this.#saveMapInStorageAsync(map);
  }

  async getSettingsAsync(): Promise<Partial<Settings>> {
    const settings = await this.#getFromStorageAsync<Settings>(StorageKeys.settings);

    return { ...settings };
  }

  async saveSettingsAsync(settings: Settings) {
    await this.#saveInStorageAsync(StorageKeys.settings, settings);
    this.#sendUpdateStorageMessage();
  }

  async replaceAllAsync(gestures: GestureMap, settings: Settings) {
    const obj: Record<string, string> = {};
    obj[StorageKeys.data] = JSON.stringify(gestures);
    obj[StorageKeys.settings] = JSON.stringify(settings);
    await chrome.storage.local.set(obj);
    this.#sendUpdateStorageMessage();
  }

  async #saveMapInStorageAsync(map: GestureMap) {
    await this.#saveInStorageAsync(StorageKeys.data, map);
    this.#sendUpdateStorageMessage();
  }

  #sendUpdateStorageMessage() {
    const message: UpdateStorageMessage = { type: Consts.messageTypes.updateStorage };
    chrome.runtime.sendMessage(message);
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
