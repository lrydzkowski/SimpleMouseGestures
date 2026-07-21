import { Consts } from '../../shared/consts';
import type { BackupData, GestureMap, Settings } from '../../shared/types';
import { OperationResolver } from '../../service-worker-scripts/operation-resolver';
import { Storage } from './storage';

export class BackupHandler {
  #storage: Storage;
  #version = 1;
  #maxGestureTokens = 8;
  #lineColorRegex = /^#[0-9a-f]{6}$/i;
  #minLineWidth = 1;
  #maxLineWidth = 10;

  constructor(storage: Storage) {
    this.#storage = storage;
  }

  async buildExportFileContentAsync() {
    const gestures = await this.#storage.getAllGesturesAsync();
    const settings = await this.#storage.getSettingsAsync();

    return JSON.stringify({ version: this.#version, gestures, settings }, null, 2);
  }

  parseImportFileContent(fileContent: string): BackupData {
    const data = this.#parseJson(fileContent);
    if (!this.#isPlainObject(data)) {
      throw new Error('The file does not contain a backup object.');
    }

    if (data.version !== this.#version) {
      throw new Error(`Unsupported backup version '${data.version}'. Supported version: ${this.#version}.`);
    }

    return {
      gestures: this.#validateGestures(data.gestures),
      settings: this.#validateSettings(data.settings),
    };
  }

  #parseJson(fileContent: string): unknown {
    try {
      return JSON.parse(fileContent);
    } catch {
      throw new Error('The file is not valid JSON.');
    }
  }

  #isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  #validateGestures(gestures: unknown): GestureMap {
    if (!this.#isPlainObject(gestures)) {
      throw new Error(`'gestures' has to be an object.`);
    }

    const validatedGestures: GestureMap = {};
    for (const gestureKey in gestures) {
      if (!Object.hasOwnProperty.call(gestures, gestureKey)) {
        continue;
      }

      this.#validateGestureKey(gestureKey);
      validatedGestures[gestureKey] = this.#validateOperationKey(gestureKey, gestures[gestureKey]);
    }

    return validatedGestures;
  }

  #validateGestureKey(gestureKey: string) {
    const allowedTokens: string[] = Object.values(Consts.gesture);
    const tokens = gestureKey.split('|');
    if (tokens.length > this.#maxGestureTokens) {
      throw new Error(`Gesture '${gestureKey}' has more than ${this.#maxGestureTokens} elements.`);
    }

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];

      if (allowedTokens.indexOf(token) === -1) {
        throw new Error(
          `Gesture '${gestureKey}' contains '${token}', but only the following tokens are allowed: '${allowedTokens.join("', '")}'.`,
        );
      }

      if (index > 0 && token === tokens[index - 1]) {
        throw new Error(`Gesture '${gestureKey}' has two of the same tokens next to each other.`);
      }
    }
  }

  #validateOperationKey(gestureKey: string, operationKey: unknown): string {
    if (typeof operationKey !== 'string' || !OperationResolver.operations.hasOwnProperty(operationKey)) {
      throw new Error(`Gesture '${gestureKey}' points to an unknown operation '${operationKey}'.`);
    }

    return operationKey;
  }

  #validateSettings(settings: unknown): Settings {
    if (!this.#isPlainObject(settings)) {
      throw new Error(`'settings' has to be an object.`);
    }

    if (typeof settings.lineColor !== 'string' || !this.#lineColorRegex.test(settings.lineColor)) {
      throw new Error(`Line color '${settings.lineColor}' is not a hex color like '#4a90d9'.`);
    }

    return {
      lineColor: settings.lineColor,
      lineWidth: this.#validateLineWidth(settings.lineWidth),
    };
  }

  #validateLineWidth(lineWidth: unknown): number {
    const errorMessage = `Line width '${lineWidth}' has to be an integer between ${this.#minLineWidth} and ${this.#maxLineWidth}.`;

    if (typeof lineWidth !== 'number' && typeof lineWidth !== 'string') {
      throw new Error(errorMessage);
    }

    const normalizedLineWidth = Number(lineWidth);
    if (
      !Number.isInteger(normalizedLineWidth) ||
      normalizedLineWidth < this.#minLineWidth ||
      normalizedLineWidth > this.#maxLineWidth
    ) {
      throw new Error(errorMessage);
    }

    return normalizedLineWidth;
  }
}
