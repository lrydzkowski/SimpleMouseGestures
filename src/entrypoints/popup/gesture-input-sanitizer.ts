export class GestureInputSanitizer {
  sanitize(value: string) {
    return value.replace(/[^a-zA-Z]/g, '');
  }
}
