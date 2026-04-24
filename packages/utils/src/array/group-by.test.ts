import { describe, expect, it } from 'vitest';
import { groupBy } from './group-by';

describe('groupBy', () => {
  it('groups items by string key', () => {
    const users = [
      { name: 'Ada', role: 'admin' },
      { name: 'Ben', role: 'member' },
      { name: 'Cam', role: 'admin' },
    ];
    expect(groupBy(users, (u) => u.role)).toEqual({
      admin: [
        { name: 'Ada', role: 'admin' },
        { name: 'Cam', role: 'admin' },
      ],
      member: [{ name: 'Ben', role: 'member' }],
    });
  });

  it('groups items by number key', () => {
    expect(groupBy([1.1, 2.3, 1.9, 2.8], (n) => Math.floor(n))).toEqual({
      1: [1.1, 1.9],
      2: [2.3, 2.8],
    });
  });

  it('passes index to key function', () => {
    const grouped = groupBy(['a', 'b', 'c', 'd'], (_, i) => (i % 2 === 0 ? 'even' : 'odd'));
    expect(grouped).toEqual({ even: ['a', 'c'], odd: ['b', 'd'] });
  });

  it('returns empty object for empty input', () => {
    expect(groupBy<number, string>([], (n) => String(n))).toEqual({});
  });
});
