export function omit<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> {
  const excluded = new Set<PropertyKey>(keys);
  const result = {} as Record<PropertyKey, unknown>;
  for (const key of Object.keys(source) as (keyof T)[]) {
    if (!excluded.has(key)) {
      result[key as PropertyKey] = source[key];
    }
  }
  return result as Omit<T, K>;
}
