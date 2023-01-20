const leftButton = 0;

function addDeleteEvent(deleteButton) {
  deleteButton.addEventListener('mousedown', (event) => {
    if (event.button !== leftButton) {
      return;
    }

    event.target.parentNode.remove()
  });
}

function createRow(gestureValue, eventValue) {
  const row = document.createElement('div');
  row.className = 'row';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Delete';
  addDeleteEvent(deleteButton);
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

function handleCreateRowEvent(rowNode) {
  const allowedChars = ['U', 'R', 'D', 'L'];
  
  const gestureValue = rowNode.querySelector('.gesture-input').value.trim();
  const eventValue = rowNode.querySelector('.event-select').value;

  if (gestureValue.length === 0) {
    alert('Gesture cannot be empty.');

    return;
  }

  for (let index = 0; index < gestureValue.length; index++) {
    const char = gestureValue[index];
    
    if (allowedChars.indexOf(char) === -1) {
      alert(`Char '${char}' is not allowed. You can only used the following chars: 'U', 'R', 'D', 'L'.`);

      return;
    }
  }

  createRow(gestureValue, eventValue);
}

const addButton = document.querySelector('.add-button');
addButton.addEventListener('mousedown', (event) => {
  if (event.button !== leftButton) {
    return;
  }

  const parentNode = event.target.parentNode;
  handleCreateRowEvent(parentNode);
});

const gestureInput = document.querySelector('.gesture-input');
gestureInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') {
    return;
  }

  const parentNode = event.target.parentNode.parentNode;
  handleCreateRowEvent(parentNode);
});

const deleteButtons = document.querySelectorAll('.delete-button');
for (const deleteButton of deleteButtons) {
  addDeleteEvent(deleteButton);
}
