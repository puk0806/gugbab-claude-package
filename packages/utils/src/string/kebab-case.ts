import { words } from './_words';

export function kebabCase(input: string): string {
  return words(input)
    .map((word) => word.toLowerCase())
    .join('-');
}
