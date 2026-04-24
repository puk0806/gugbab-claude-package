import { describe, expect, it } from 'vitest';
import { truncate } from './truncate';

describe('truncate', () => {
  it('returns input unchanged when shorter than length', () => {
    expect(truncate('hello', { length: 10 })).toBe('hello');
  });

  it('returns input unchanged when equal to length', () => {
    expect(truncate('hello', { length: 5 })).toBe('hello');
  });

  it('truncates and appends default suffix', () => {
    expect(truncate('hello world', { length: 8 })).toBe('hello w…');
  });

  it('respects custom suffix', () => {
    expect(truncate('hello world', { length: 8, suffix: '...' })).toBe('hello...');
  });

  it('handles length smaller than suffix length', () => {
    expect(truncate('hello world', { length: 2, suffix: '...' })).toBe('...');
  });

  it('handles empty input', () => {
    expect(truncate('', { length: 5 })).toBe('');
  });
});
