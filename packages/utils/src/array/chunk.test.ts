import { describe, expect, it } from 'vitest';
import { chunk } from './chunk';

describe('chunk', () => {
  it('splits array into equal-sized chunks', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('last chunk contains remainder', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('works when size is larger than array length', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('throws on non-positive size', () => {
    expect(() => chunk([1, 2], 0)).toThrow(RangeError);
    expect(() => chunk([1, 2], -1)).toThrow(RangeError);
  });

  it('throws on non-integer size', () => {
    expect(() => chunk([1, 2], 1.5)).toThrow(RangeError);
  });
});
