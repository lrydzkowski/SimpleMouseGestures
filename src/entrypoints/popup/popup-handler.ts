import { Consts } from '../../shared/consts';
import type { Settings } from '../../shared/types';
import { OperationResolver } from '../../service-worker-scripts/operation-resolver';
import { Storage } from './storage';
import { GesturesSerializer } from './gestures-serializer';
import { BackupHandler } from './backup-handler';

interface OperationOption {
  value: string;
  label: string;
}

export class PopupHandler {
  #storage: Storage;
  #gesturesSerializer: GesturesSerializer;
  #backupHandler: BackupHandler;

  constructor(storage: Storage, gesturesSerializer: GesturesSerializer, backupHandler: BackupHandler) {
    this.#storage = storage;
    this.#gesturesSerializer = gesturesSerializer;
    this.#backupHandler = backupHandler;
  }

  async initAsync() {
    this.#initOperationSelect();
    this.#registerEvents();
    await this.#restoreListAsync();
    await this.#restoreSettingsAsync();
  }

  #initOperationSelect() {
    const operationSelect = document.querySelector<HTMLSelectElement>('#operation-select')!;
    const operations = this.#getOperationList();
    for (const operation of operations) {
      this.#addOperationOption(operationSelect, operation);
    }
  }

  #getOperationList() {
    const operations: OperationOption[] = [];
    for (const operationKey in OperationResolver.operations) {
      if (Object.hasOwnProperty.call(OperationResolver.operations, operationKey)) {
        const operation = OperationResolver.operations[operationKey];
        operations.push({
          value: operationKey,
          label: operation.label,
        });
      }
    }

    return operations;
  }

  #addOperationOption(operationSelect: HTMLSelectElement, operation: OperationOption) {
    const option = document.createElement('option');
    option.value = operation.value;
    option.text = operation.label;
    operationSelect.append(option);
  }

  #registerEvents() {
    this.#registerTabEvent();
    this.#registerAddButtonEvent();
    this.#registerGestureInputEvent();
    this.#registerDeleteButtonsEvent();
    this.#registerSettingsAutoSaveEvents();
    this.#registerExportButtonEvent();
    this.#registerImportButtonEvent();
    this.#registerImportFileInputEvent();
  }

  #registerTabEvent() {
    const headers = document.querySelectorAll<HTMLButtonElement>('.header');
    for (const header of headers) {
      header.addEventListener('click', (event) => {
        const activeClass = 'active';

        const currentlyActiveHeader = document.querySelector(`.header.${activeClass}`)!;
        currentlyActiveHeader.classList.remove(activeClass);
        currentlyActiveHeader.setAttribute('aria-selected', 'false');
        const currentlyActiveTab = document.querySelector(`.tab.${activeClass}`)!;
        currentlyActiveTab.classList.remove(activeClass);

        const tabName = (event.currentTarget as HTMLElement).getAttribute('data-name');
        const newActiveHeader = document.querySelector(`.header[data-name="${tabName}"]`)!;
        newActiveHeader.classList.add(activeClass);
        newActiveHeader.setAttribute('aria-selected', 'true');
        const newActiveTab = document.querySelector(`.tab[data-name="${tabName}"]`)!;
        newActiveTab.classList.add(activeClass);
      });
    }
  }

  #registerAddButtonEvent() {
    const addButton = document.querySelector<HTMLButtonElement>('.add-button')!;
    addButton.addEventListener('click', async (event) => {
      const addRow = (event.currentTarget as HTMLElement).closest<HTMLElement>('.add-row')!;
      await this.#handleCreateRowEventAsync(addRow);
    });
  }

  #registerGestureInputEvent() {
    const gestureInput = document.querySelector<HTMLInputElement>('.gesture-input')!;
    gestureInput.addEventListener('keydown', async (event) => {
      await this.#handleGestureInputEventAsync(event);
    });
  }

  #registerDeleteButtonsEvent() {
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>('.delete-button');
    for (const deleteButton of deleteButtons) {
      this.#registerDeleteButtonEvent(deleteButton);
    }
  }

  #registerDeleteButtonEvent(deleteButton: HTMLButtonElement) {
    deleteButton.addEventListener('click', async (event) => {
      const rowNode = (event.currentTarget as HTMLElement).closest<HTMLElement>('.row')!;
      await this.#handleDeleteRowEventAsync(rowNode);
    });
  }

  #registerSettingsAutoSaveEvents() {
    const lineColorInput = document.querySelector<HTMLInputElement>('.tab[data-name="settings"] #line-color')!;
    const lineWidthSelect = document.querySelector<HTMLSelectElement>('.tab[data-name="settings"] #line-width')!;
    const saveAsync = async () => {
      await this.#saveSettingsAsync({
        lineColor: lineColorInput.value,
        lineWidth: lineWidthSelect.value,
      });
    };
    lineColorInput.addEventListener('change', saveAsync);
    lineWidthSelect.addEventListener('change', saveAsync);
  }

  #registerExportButtonEvent() {
    const exportButton = document.querySelector<HTMLButtonElement>('#export-button')!;
    exportButton.addEventListener('click', async () => {
      await this.#exportBackupAsync();
    });
  }

  #registerImportButtonEvent() {
    const importButton = document.querySelector<HTMLButtonElement>('#import-button')!;
    importButton.addEventListener('click', () => {
      document.querySelector<HTMLInputElement>('#import-file-input')!.click();
    });
  }

  #registerImportFileInputEvent() {
    const importFileInput = document.querySelector<HTMLInputElement>('#import-file-input')!;
    importFileInput.addEventListener('change', async (event) => {
      await this.#importBackupAsync(event.target as HTMLInputElement);
    });
  }

  async #exportBackupAsync() {
    this.#clearBackupMessage();
    const fileContent = await this.#backupHandler.buildExportFileContentAsync();
    const url = URL.createObjectURL(new Blob([fileContent], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simple-mouse-gestures-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async #importBackupAsync(importFileInput: HTMLInputElement) {
    const file = importFileInput.files?.[0];
    importFileInput.value = '';
    if (file === undefined) {
      return;
    }

    this.#clearBackupMessage();

    let backupData = null;
    try {
      backupData = this.#backupHandler.parseImportFileContent(await file.text());
    } catch (e) {
      this.#showBackupMessage(e instanceof Error ? e.message : String(e), true);

      return;
    }

    const confirmed = await this.#confirmReplaceAsync();
    if (!confirmed) {
      return;
    }

    await this.#storage.replaceAllAsync(backupData.gestures, backupData.settings);
    await this.#refreshAfterImportAsync();
    this.#showBackupMessage('Settings have been imported. Reload already-open pages to start using them.', false);
  }

  #confirmReplaceAsync() {
    const dialog = document.querySelector<HTMLDialogElement>('#import-dialog')!;
    dialog.returnValue = '';

    return new Promise<boolean>((resolve) => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'replace'), { once: true });
      dialog.showModal();
    });
  }

  async #refreshAfterImportAsync() {
    document.querySelector('.tab[data-name="gestures"] .list-content')!.replaceChildren();
    await this.#restoreListAsync();
    await this.#restoreSettingsAsync();
  }

  async #handleGestureInputEventAsync(event: KeyboardEvent) {
    this.#clearValidationError();

    const gestureInput = event.target as HTMLInputElement;
    if (event.key === Consts.enter) {
      const addRow = gestureInput.closest<HTMLElement>('.add-row')!;
      await this.#handleCreateRowEventAsync(addRow);

      return;
    }

    let charToAdd = null;

    switch (event.key) {
      case Consts.arrowUp:
        charToAdd = 'U';
        break;
      case Consts.arrowRight:
        charToAdd = 'R';
        break;
      case Consts.arrowDown:
        charToAdd = 'D';
        break;
      case Consts.arrowLeft:
        charToAdd = 'L';
        break;
      default:
        return;
    }

    if (charToAdd !== null) {
      const newValue = gestureInput.value + charToAdd;
      setTimeout(() => {
        gestureInput.value = newValue;
      });
    }
  }

  async #handleCreateRowEventAsync(rowNode: HTMLElement) {
    const allowedChars = ['U', 'R', 'D', 'L'];

    const gestureInput = rowNode.querySelector<HTMLInputElement>('.gesture-input')!;
    const gestureValue = gestureInput.value.trim().toUpperCase();
    const operationValue = rowNode.querySelector<HTMLSelectElement>('#operation-select')!.value;

    if (gestureValue.length === 0) {
      this.#showValidationError('Gesture cannot be empty.', gestureInput);

      return;
    }

    if (gestureValue.length > 8) {
      this.#showValidationError('You cannot have a gesture with more than 8 elements.', gestureInput);

      return;
    }

    for (let index = 0; index < gestureValue.length; index++) {
      const char = gestureValue[index];

      if (allowedChars.indexOf(char) === -1) {
        this.#showValidationError(
          `Char '${char}' is not allowed. You can only used the following chars: '${allowedChars.join("', '")}'.`,
          gestureInput,
        );

        return;
      }

      if (index > 0 && char === gestureValue[index - 1]) {
        this.#showValidationError(`You cannot have two of the same chars next to each other.`, gestureInput);

        return;
      }
    }

    const deserializedGestureValue = this.#gesturesSerializer.deserialize(gestureValue);
    if (await this.#storage.gestureExistsAsync(deserializedGestureValue)) {
      this.#showValidationError(`Gesture ${deserializedGestureValue} exists.`, gestureInput);

      return;
    }

    this.#clearValidationError();
    this.#createRow(gestureValue, this.#getOperationLabel(operationValue));
    gestureInput.value = '';
    await this.#storage.saveGesturesAsync(deserializedGestureValue, operationValue);
  }

  async #handleDeleteRowEventAsync(rowNode: HTMLElement) {
    const deserializedGestureValue = this.#gesturesSerializer.deserialize(rowNode.dataset.gestureValue ?? '');
    await this.#storage.deleteGesturesAsync(deserializedGestureValue);
    rowNode.remove();
  }

  async #restoreListAsync() {
    const allGestures = await this.#storage.getAllGesturesAsync();
    for (const gesture in allGestures) {
      if (Object.hasOwnProperty.call(allGestures, gesture)) {
        const operationKey = allGestures[gesture];
        this.#createRow(this.#gesturesSerializer.serialize(gesture), this.#getOperationLabel(operationKey));
      }
    }
  }

  #getOperationLabel(operationKey: string) {
    return OperationResolver.operations[operationKey]?.label ?? '';
  }

  #showValidationError(message: string, gestureInput: HTMLInputElement) {
    document.querySelector('.field-error')!.textContent = message;
    gestureInput.focus();
  }

  #clearValidationError() {
    document.querySelector('.field-error')!.textContent = '';
  }

  #showBackupMessage(message: string, isError: boolean) {
    const messageElement = document.querySelector('#backup-message')!;
    messageElement.textContent = message;
    messageElement.classList.toggle('error', isError);
    messageElement.classList.toggle('success', !isError);
  }

  #clearBackupMessage() {
    const messageElement = document.querySelector('#backup-message')!;
    messageElement.textContent = '';
    messageElement.classList.remove('error', 'success');
  }

  #createRow(gestureValue: string, operationLabel: string) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.gestureValue = gestureValue;

    const gestureChip = document.createElement('span');
    gestureChip.className = 'gesture-chip';
    gestureChip.textContent = gestureValue;
    row.append(gestureChip);

    const operationText = document.createElement('span');
    operationText.textContent = operationLabel;
    row.append(operationText);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button icon-button';
    deleteButton.setAttribute('aria-label', `Delete gesture ${gestureValue}`);
    deleteButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
    this.#registerDeleteButtonEvent(deleteButton);
    row.append(deleteButton);

    document.querySelector('.tab[data-name="gestures"] .list-content')!.append(row);
  }

  async #restoreSettingsAsync() {
    const settings = await this.#storage.getSettingsAsync();
    const lineColorInput = document.querySelector<HTMLInputElement>('.tab[data-name="settings"] #line-color')!;
    lineColorInput.value = settings.lineColor ?? '';
    lineColorInput.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector<HTMLSelectElement>('.tab[data-name="settings"] #line-width')!.value = String(
      settings.lineWidth ?? '',
    );
  }

  async #saveSettingsAsync(settings: Settings) {
    await this.#storage.saveSettingsAsync(settings);
  }
}
