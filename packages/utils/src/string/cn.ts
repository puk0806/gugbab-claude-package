/**
 * Concatenates class names while filtering out falsy values
 * (`undefined`, `null`, `false`, `''`).
 *
 * @example
 *   cn('btn', isPrimary && 'btn--primary', className)
 */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ');
}
