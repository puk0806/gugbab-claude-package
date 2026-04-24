import { describe, expect, it } from 'vitest';
import { kebabCase } from './kebab-case';

describe('kebabCase', () => {
  it('converts camelCase', () => {
    expect(kebabCase('userProfileCard')).toBe('user-profile-card');
  });

  it('converts PascalCase', () => {
    expect(kebabCase('UserProfileCard')).toBe('user-profile-card');
  });

  it('converts snake_case', () => {
    expect(kebabCase('user_profile_card')).toBe('user-profile-card');
  });

  it('converts space-separated', () => {
    expect(kebabCase('hello world')).toBe('hello-world');
  });

  it('lowercases consecutive uppercase as one word', () => {
    expect(kebabCase('parseHTMLString')).toBe('parse-html-string');
  });

  it('returns empty string for empty input', () => {
    expect(kebabCase('')).toBe('');
  });
});
