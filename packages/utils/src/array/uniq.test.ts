import { describe, expect, it } from 'vitest';
import { uniq } from './uniq';

describe('uniq', () => {
  it('removes duplicate primitives', () => {
    expect(uniq([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    expect(uniq(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('preserves first-occurrence order', () => {
    expect(uniq([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });

  it('uses SameValueZero equality (NaN dedupes)', () => {
    const result = uniq([Number.NaN, Number.NaN, 1]);
    expect(result.length).toBe(2);
    expect(Number.isNaN(result[0])).toBe(true);
    expect(result[1]).toBe(1);
  });

  it('handles empty array', () => {
    expect(uniq([])).toEqual([]);
  });
});
