import { describe, expect, it } from 'vitest';
import { camelCase } from './camel-case';

describe('camelCase', () => {
  it('converts space-separated words', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
  });

  it('converts kebab-case', () => {
    expect(camelCase('user-profile-card')).toBe('userProfileCard');
  });

  it('converts snake_case', () => {
    expect(camelCase('user_profile_card')).toBe('userProfileCard');
  });

  it('converts PascalCase', () => {
    expect(camelCase('UserProfileCard')).toBe('userProfileCard');
  });

  it('handles mixed separators', () => {
    expect(camelCase('foo-bar_baz qux')).toBe('fooBarBazQux');
  });

  it('preserves digit groups as their own word', () => {
    expect(camelCase('version-2-0')).toBe('version20');
  });

  it('returns empty string for empty input', () => {
    expect(camelCase('')).toBe('');
  });
});
