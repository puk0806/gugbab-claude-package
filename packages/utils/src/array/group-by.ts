export function groupBy<T, K extends PropertyKey>(
  array: readonly T[],
  keyFn: (item: T, index: number) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  array.forEach((item, index) => {
    const key = keyFn(item, index);
    const bucket = result[key];
    if (bucket) {
      bucket.push(item);
    } else {
      result[key] = [item];
    }
  });
  return result;
}
