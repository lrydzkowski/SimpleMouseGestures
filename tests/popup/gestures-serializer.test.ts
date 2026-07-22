import { describe, expect, it } from 'vitest';
import { GesturesSerializer } from '../../src/entrypoints/popup/gestures-serializer';

describe('GesturesSerializer', () => {
  const serializer = new GesturesSerializer();

  it('serializes the storage form to uppercase letters', () => {
    expect(serializer.serialize('up|left')).toBe('UL');
  });

  it('serializes all four directions', () => {
    expect(serializer.serialize('up|right|down|left')).toBe('URDL');
  });

  it('serializes a single direction', () => {
    expect(serializer.serialize('down')).toBe('D');
  });

  it('deserializes letters to the storage form', () => {
    expect(serializer.deserialize('UL')).toBe('up|left');
  });

  it('deserializes all four letters', () => {
    expect(serializer.deserialize('URDL')).toBe('up|right|down|left');
  });

  it('deserializes lowercase letters', () => {
    expect(serializer.deserialize('ul')).toBe('up|left');
  });

  it('skips letters that are not directions', () => {
    expect(serializer.deserialize('UXL')).toBe('up|left');
  });

  it('round trips from letter form through storage form', () => {
    expect(serializer.serialize(serializer.deserialize('URDL'))).toBe('URDL');
  });

  it('round trips from storage form through letter form', () => {
    expect(serializer.deserialize(serializer.serialize('left|down|right'))).toBe('left|down|right');
  });
});
