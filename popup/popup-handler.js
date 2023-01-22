export class PopupHandler {
  #operationResolver;
  #storage;
  #gesturesSerializer;

  constructor(operationResolver, storage, gesturesSerializer) {
    this.#operationResolver = operationResolver;
    this.#storage = storage;
    this.#gesturesSerializer = gesturesSerializer;
    this.#initEventSelect();
  }

  registerEvents() {
    this.#registerAddButtonEvent();
    this.#registerGestureInputEvent();
    this.#registerDeleteButtonsEvent();
  }

  async restoreListAsync() {
    const allGestures = await this.#storage.getAllAsync();
    for (const gesture in allGestures) {
      if (Object.hasOwnProperty.call(allGestures, gesture)) {
        const eventValue = allGestures[gesture];
        this.#createRow(
          this.#gesturesSerializer.serialize(gesture),
          this.#operationResolver.getOperationLabel(eventValue)
        );
      }
    }
  }

  #initEventSelect() {
    const eventSelect = document.querySelector('#event-select');
    const elements = this.#operationResolver.getList();
    for (const element of elements) {
      this.#addEventOption(eventSelect, element);
    }
  }

  #addEventOption(eventSelect, element) {
    const option = document.createElement('option');
    option.value = element.value;
    option.text = element.label;
    eventSelect.append(option);
  }

  #registerAddButtonEvent() {
    const addButton = document.querySelector('.add-button');
    addButton.addEventListener('mousedown', (event) => {
      if (event.button !== Consts.leftButton) {
        return;
      }

      const parentNode = event.target.parentNode;
      this.#handleCreateRowEvent(parentNode);
    });
  }

  #registerGestureInputEvent() {
    const gestureInput = document.querySelector('.gesture-input');
    gestureInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      const parentNode = event.target.parentNode.parentNode;
      this.#handleCreateRowEvent(parentNode);
    });
  }

  #registerDeleteButtonsEvent() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    for (const deleteButton of deleteButtons) {
      this.#addDeleteButtonEvent(deleteButton);
    }
  }

  #addDeleteButtonEvent(deleteButton) {
    deleteButton.addEventListener('mousedown', (event) => {
      if (event.button !== Consts.leftButton) {
        return;
      }

      event.target.parentNode.remove()
    });
  }

  #handleCreateRowEvent(rowNode) {
    const allowedChars = ['U', 'R', 'D', 'L'];
    
    const gestureInput = rowNode.querySelector('.gesture-input');
    const gestureValue = gestureInput.value.trim().toUpperCase();
    const eventValue = rowNode.querySelector('#event-select').value;

    if (gestureValue.length === 0) {
      alert('Gesture cannot be empty.');
      gestureInput.focus();

      return;
    }

    for (let index = 0; index < gestureValue.length; index++) {
      const char = gestureValue[index];
      
      if (allowedChars.indexOf(char) === -1) {
        alert(`Char '${char}' is not allowed. You can only used the following chars: '${allowedChars.join('\', \'')}'.`);
        gestureInput.focus();

        return;
      }
    }

    this.#createRow(gestureValue, this.#operationResolver.getOperationLabel(eventValue));
    gestureInput.value = '';
    this.#storage.saveAsync(this.#gesturesSerializer.deserialize(gestureValue), eventValue);
  }

  #createRow(gestureValue, eventValue) {
    const row = document.createElement('div');
    row.className = 'row';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    this.#addDeleteButtonEvent(deleteButton);
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