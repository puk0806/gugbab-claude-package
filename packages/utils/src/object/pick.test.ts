import { describe, expect, it } from 'vitest';
import { pick } from './pick';

describe('pick', () => {
  it('returns an object with only the listed keys', () => {
    const source = { a: 1, b: 2, c: 3 };
    expect(pick(source, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('ignores keys that are not present', () => {
    const source = { a: 1 };
    expect(pick(source, ['a' as 'a'])).toEqual({ a: 1 });
  });

  it('does not mutate the source', () => {
    const source = { a: 1, b: 2 };
    pick(source, ['a']);
    expect(source).toEqual({ a: 1, b: 2 });
  });

  it('returns empty object when no keys given', () => {
    expect(pick({ a: 1 }, [])).toEqual({});
  });

  it('skips inherited (prototype) keys', () => {
    const proto = { inherited: 'nope' };
    const source = Object.create(proto) as { own?: number };
    source.own = 1;
    expect(pick(source, ['own'])).toEqual({ own: 1 });
  });
});
