import { OperationResolver } from '/service-worker-scripts/operation-resolver.js';

export class PopupHandler {
  #storage;
  #gesturesSerializer;

  constructor(storage, gesturesSerializer) {
    this.#storage = storage;
    this.#gesturesSerializer = gesturesSerializer;
  }

  async initAsync() {
    this.#initOperationSelect();
    this.#registerEvents();
    this.#restoreListAsync();
  }

  #initOperationSelect() {
    const operationSelect = document.querySelector('#operation-select');
    const operations = this.#getOperationList();
    for (const operation of operations) {
      this.#addOperationOption(operationSelect, operation);
    }
  }

  #getOperationList() {
    const operations = [];
    for (const operationKey in OperationResolver.operations) {
      if (Object.hasOwnProperty.call(OperationResolver.operations, operationKey)) {
        const operation = OperationResolver.operations[operationKey];
        operations.push({
          value: operationKey,
          label: operation.label
        });
      }
    }

    return operations;
  }

  #addOperationOption(operationSelect, operation) {
    const option = document.createElement('option');
    option.value = operation.value;
    option.text = operation.label;
    operationSelect.append(option);
  }

  #registerEvents() {
    this.#registerAddButtonEvent();
    this.#registerGestureInputEvent();
    this.#registerDeleteButtonsEvent();
  }

  #registerAddButtonEvent() {
    const addButton = document.querySelector('.add-button');
    addButton.addEventListener('mousedown', async (event) => {
      if (event.button !== Consts.leftButton) {
        return;
      }

      const parentNode = event.target.parentNode;
      await this.#handleCreateRowEventAsync(parentNode);
    });
  }

  #registerGestureInputEvent() {
    const gestureInput = document.querySelector('.gesture-input');
    gestureInput.addEventListener('keydown', async (event) => {
      await this.#handleGestureInputEventAsync(event);
    });
  }

  #registerDeleteButtonsEvent() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    for (const deleteButton of deleteButtons) {
      this.#registerDeleteButtonEvent(deleteButton);
    }
  }

  #registerDeleteButtonEvent(deleteButton) {
    deleteButton.addEventListener('mousedown', async (event) => {
      if (event.button !== Consts.leftButton) {
        return;
      }

      const parentNode = event.target.parentNode;
      await this.#handleDeleteRowEventAsync(parentNode);
    });
  }

  async #handleGestureInputEventAsync(event) {
    if (event.key === Consts.enter) {
      const parentNode = event.target.parentNode.parentNode;
      await this.#handleCreateRowEventAsync(parentNode);

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
      const newValue = event.target.value + charToAdd;
      setTimeout(() => {
        event.target.value = newValue;
      });
    }
  }

  async #handleCreateRowEventAsync(rowNode) {
    const allowedChars = ['U', 'R', 'D', 'L'];
    
    const gestureInput = rowNode.querySelector('.gesture-input');
    const gestureValue = gestureInput.value.trim().toUpperCase();
    const operationValue = rowNode.querySelector('#operation-select').value;

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
          `Char '${char}' is not allowed. You can only used the following chars: '${allowedChars.join('\', \'')}'.`,
          gestureInput
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

    this.#createRow(gestureValue, this.#getOperationLabel(operationValue));
    gestureInput.value = '';
    await this.#storage.saveAsync(deserializedGestureValue, operationValue);
  }

  async #handleDeleteRowEventAsync(rowNode) {
    const deserializedGestureValue = this.#gesturesSerializer.deserialize(rowNode.dataset.gestureValue);
    await this.#storage.deleteAsync(deserializedGestureValue);
    rowNode.remove();
  }

  async #restoreListAsync() {
    const allGestures = await this.#storage.getAllAsync();
    for (const gesture in allGestures) {
      if (Object.hasOwnProperty.call(allGestures, gesture)) {
        const eventValue = allGestures[gesture];
        this.#createRow(
          this.#gesturesSerializer.serialize(gesture),
          this.#getOperationLabel(eventValue)
        );
      }
    }
  }

  #getOperationLabel(operationKey) {
    return OperationResolver.operations[operationKey]?.label;
  }

  #showValidationError(message, gestureInput) {
    alert(message);
    gestureInput.focus();
  }

  #createRow(gestureValue, eventValue) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.gestureValue = gestureValue;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    this.#registerDeleteButtonEvent(deleteButton);
    row.append(deleteButton);

    const gestureParagraph = document.createElement('p');
    gestureParagraph.textContent = 'Gesture: ';
    const gestureValueText = document.createElement('b');
    gestureValueText.textContent = gestureValue;
    gestureParagraph.append(gestureValueText);
    row.append(gestureParagraph);

    const eventParagraph = document.createElement('p');
    eventParagraph.textContent = 'Event: ';
    const eventValueText = document.createElement('b');
    eventValueText.textContent = eventValue;
    eventParagraph.append(eventValueText);
    row.append(eventParagraph);

    document.querySelector('.list-content').append(row);
  }
}