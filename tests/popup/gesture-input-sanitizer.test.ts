import { describe, expect, it } from 'vitest';
import { GestureInputSanitizer } from '../../src/entrypoints/popup/gesture-input-sanitizer';

describe('GestureInputSanitizer', () => {
  const sanitizer = new GestureInputSanitizer();

  it('keeps uppercase letters', () => {
    expect(sanitizer.sanitize('URDL')).toBe('URDL');
  });

  it('keeps lowercase letters', () => {
    expect(sanitizer.sanitize('urdl')).toBe('urdl');
  });

  it('keeps letters outside the gesture alphabet', () => {
    expect(sanitizer.sanitize('XyZ')).toBe('XyZ');
  });

  it('strips digits', () => {
    expect(sanitizer.sanitize('u1r2')).toBe('ur');
  });

  it('strips symbols', () => {
    expect(sanitizer.sanitize('u-r_d.l!')).toBe('urdl');
  });

  it('strips spaces', () => {
    expect(sanitizer.sanitize(' u r ')).toBe('ur');
  });

  it('strips non-letters from mixed input', () => {
    expect(sanitizer.sanitize('u1r-2d')).toBe('urd');
  });

  it('returns an empty string when nothing is a letter', () => {
    expect(sanitizer.sanitize('123 -!')).toBe('');
  });

  it('returns an empty string for an empty string', () => {
    expect(sanitizer.sanitize('')).toBe('');
  });
});
