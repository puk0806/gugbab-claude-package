import { describe, expect, it } from 'vitest';
import { isNumber } from './is-number';

describe('isNumber', () => {
  it('returns true for finite numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(1.5)).toBe(true);
    expect(isNumber(-42)).toBe(true);
  });

  it('returns true for Infinity and -Infinity', () => {
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
    expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isNumber(Number.NaN)).toBe(false);
  });

  it('returns false for numeric strings', () => {
    expect(isNumber('42')).toBe(false);
  });

  it('returns false for null, undefined, boolean', () => {
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber(true)).toBe(false);
  });
});
