class SelectedTextHandler {
  #selectedText = '';

  saveSelectedText() {
    this.#selectedText = window?.getSelection()?.toString()?.trim() ?? '';
  }

  getSelectedText() {
    return this.#selectedText;
  }
}