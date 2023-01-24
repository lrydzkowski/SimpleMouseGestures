import { Storage } from '/service-worker-scripts/storage.js';

export class StorageFactory {
  static #storage;
  static getStorage() {
    if (StorageFactory.#storage === undefined) {
      StorageFactory.#storage = new Storage();
    }

    return StorageFactory.#storage;
  }
}