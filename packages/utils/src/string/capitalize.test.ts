import { describe, expect, it } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('uppercases the first character', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('preserves existing uppercase', () => {
    expect(capitalize('World')).toBe('World');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('does not change rest of the string', () => {
    expect(capitalize('fOO bAR')).toBe('FOO bAR');
  });
});
