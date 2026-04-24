import { describe, expect, it } from 'vitest';
import { isNonEmptyArray } from './is-non-empty-array';

describe('isNonEmptyArray', () => {
  it('returns true for non-empty arrays', () => {
    expect(isNonEmptyArray([1])).toBe(true);
    expect(isNonEmptyArray(['a', 'b'])).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it('returns false for non-arrays', () => {
    expect(isNonEmptyArray({})).toBe(false);
    expect(isNonEmptyArray('abc')).toBe(false);
    expect(isNonEmptyArray(null)).toBe(false);
    expect(isNonEmptyArray(undefined)).toBe(false);
  });

  it('narrows array type so first element is defined', () => {
    const value: unknown = [42];
    if (isNonEmptyArray<number>(value)) {
      const [first] = value;
      expect(first).toBe(42);
    }
  });
});
