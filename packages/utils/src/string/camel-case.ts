import { words } from './_words';

export function camelCase(input: string): string {
  const tokens = words(input);
  if (tokens.length === 0) return '';
  return tokens
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}
