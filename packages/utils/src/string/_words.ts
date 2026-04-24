const WORD_RE = /[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|[^A-Za-z]|$)|\d+/g;

export function words(input: string): string[] {
  return input.match(WORD_RE) ?? [];
}
