import { describe, expect, it } from 'vitest';
import { deepMerge } from './deep-merge';

describe('deepMerge', () => {
  it('merges flat objects', () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('merges nested plain objects recursively', () => {
    const a = { outer: { a: 1, nested: { x: 1 } } };
    const b = { outer: { b: 2, nested: { y: 2 } } };
    expect(deepMerge(a, b)).toEqual({
      outer: { a: 1, b: 2, nested: { x: 1, y: 2 } },
    });
  });

  it('replaces arrays instead of merging them', () => {
    expect(deepMerge({ list: [1, 2] }, { list: [3] })).toEqual({ list: [3] });
  });

  it('replaces class instances instead of merging', () => {
    const date = new Date('2026-01-01');
    const result = deepMerge({ at: new Date('2020-01-01') }, { at: date });
    expect(result.at).toBe(date);
  });

  it('does not mutate the source or target', () => {
    const a = { nested: { x: 1 } };
    const b = { nested: { y: 2 } };
    deepMerge(a, b);
    expect(a).toEqual({ nested: { x: 1 } });
    expect(b).toEqual({ nested: { y: 2 } });
  });

  it('blocks prototype pollution via __proto__', () => {
    const target: Record<string, unknown> = {};
    const malicious = JSON.parse('{"__proto__": {"polluted": true}}') as Record<string, unknown>;
    deepMerge(target, malicious);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
