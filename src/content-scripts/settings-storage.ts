import { StorageKeys } from '../shared/storage-keys';
import type { Settings } from '../shared/types';

export class SettingsStorage {
  async getSettingsAsync(): Promise<Partial<Settings>> {
    const settings = await this.#getFromStorageAsync<Settings>(StorageKeys.settings);

    return { ...settings };
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
}
