import { describe, expect, it } from 'vitest';
import { omit } from './omit';

describe('omit', () => {
  it('returns an object without the listed keys', () => {
    const source = { a: 1, b: 2, c: 3 };
    expect(omit(source, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('ignores keys that are not present', () => {
    const source = { a: 1 } as const;
    expect(omit(source, ['a'])).toEqual({});
  });

  it('does not mutate the source', () => {
    const source = { a: 1, b: 2 };
    omit(source, ['a']);
    expect(source).toEqual({ a: 1, b: 2 });
  });

  it('returns a shallow copy when no keys given', () => {
    const source = { a: 1, b: 2 };
    const result = omit(source, []);
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });
});
