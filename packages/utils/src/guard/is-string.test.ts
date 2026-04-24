import { describe, expect, it } from 'vitest';
import { isString } from './is-string';

describe('isString', () => {
  it('returns true for string literals', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('')).toBe(true);
  });

  it('returns false for non-string primitives', () => {
    expect(isString(0)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
  });

  it('returns false for objects and arrays', () => {
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
  });

  it('returns false for String object (boxed)', () => {
    expect(isString(new String('hello'))).toBe(false);
  });
});
