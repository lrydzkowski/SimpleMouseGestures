import { describe, expect, it } from 'vitest';
import { BackupHandler } from '../../src/entrypoints/popup/backup-handler';
import { Storage } from '../../src/entrypoints/popup/storage';

function createStorageStub(gestures: Record<string, string>, settings: Record<string, unknown>) {
  return {
    getAllGesturesAsync: async () => gestures,
    getSettingsAsync: async () => settings,
  } as unknown as Storage;
}

function createHandler() {
  return new BackupHandler(createStorageStub({}, {}));
}

function buildBackupContent(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    version: 1,
    gestures: { 'up|left': 'switchToLeftTab' },
    settings: { lineColor: '#4a90d9', lineWidth: 3 },
    ...overrides,
  });
}

describe('BackupHandler', () => {
  describe('buildExportFileContentAsync', () => {
    it('exports the version, all gestures, and the settings', async () => {
      const gestures = { 'up|left': 'switchToLeftTab', down: 'closeCurrentTab' };
      const settings = { lineColor: '#112233', lineWidth: 5 };
      const handler = new BackupHandler(createStorageStub(gestures, settings));

      const fileContent = await handler.buildExportFileContentAsync();

      expect(JSON.parse(fileContent)).toEqual({ version: 1, gestures, settings });
    });
  });

  describe('parseImportFileContent', () => {
    it('returns validated gestures and settings for a valid backup', () => {
      const handler = createHandler();

      const backupData = handler.parseImportFileContent(buildBackupContent());

      expect(backupData).toEqual({
        gestures: { 'up|left': 'switchToLeftTab' },
        settings: { lineColor: '#4a90d9', lineWidth: 3 },
      });
    });

    it('normalizes a string line width to a number', () => {
      const handler = createHandler();

      const backupData = handler.parseImportFileContent(
        buildBackupContent({ settings: { lineColor: '#4a90d9', lineWidth: '7' } }),
      );

      expect(backupData.settings.lineWidth).toBe(7);
    });

    it('rejects content that is not valid JSON', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent('not json')).toThrow('The file is not valid JSON.');
    });

    it('rejects content that is not a backup object', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent('[]')).toThrow('The file does not contain a backup object.');
    });

    it('rejects an unsupported version', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent(buildBackupContent({ version: 2 }))).toThrow(
        "Unsupported backup version '2'. Supported version: 1.",
      );
    });

    it('rejects gestures that are not an object', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent(buildBackupContent({ gestures: 'up' }))).toThrow(
        "'gestures' has to be an object.",
      );
    });

    it('rejects a gesture with more than 8 tokens', () => {
      const handler = createHandler();
      const gestureKey = ['up', 'down', 'up', 'down', 'up', 'down', 'up', 'down', 'up'].join('|');

      expect(() =>
        handler.parseImportFileContent(buildBackupContent({ gestures: { [gestureKey]: 'goBack' } })),
      ).toThrow(`Gesture '${gestureKey}' has more than 8 elements.`);
    });

    it('rejects a gesture with an unknown token', () => {
      const handler = createHandler();

      expect(() =>
        handler.parseImportFileContent(buildBackupContent({ gestures: { 'up|diagonal': 'goBack' } })),
      ).toThrow("Gesture 'up|diagonal' contains 'diagonal'");
    });

    it('rejects a gesture with two identical consecutive tokens', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent(buildBackupContent({ gestures: { 'up|up': 'goBack' } }))).toThrow(
        "Gesture 'up|up' has two of the same tokens next to each other.",
      );
    });

    it('rejects a gesture that points to an unknown operation', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent(buildBackupContent({ gestures: { up: 'launchRocket' } }))).toThrow(
        "Gesture 'up' points to an unknown operation 'launchRocket'.",
      );
    });

    it('rejects settings that are not an object', () => {
      const handler = createHandler();

      expect(() => handler.parseImportFileContent(buildBackupContent({ settings: null }))).toThrow(
        "'settings' has to be an object.",
      );
    });

    it('rejects an invalid line color', () => {
      const handler = createHandler();

      expect(() =>
        handler.parseImportFileContent(buildBackupContent({ settings: { lineColor: 'red', lineWidth: 3 } })),
      ).toThrow("Line color 'red' is not a hex color like '#4a90d9'.");
    });

    it.each([0, 11, 2.5, 'abc', null])('rejects the invalid line width %s', (lineWidth) => {
      const handler = createHandler();

      expect(() =>
        handler.parseImportFileContent(buildBackupContent({ settings: { lineColor: '#4a90d9', lineWidth } })),
      ).toThrow(`Line width '${lineWidth}' has to be an integer between 1 and 10.`);
    });
  });
});
