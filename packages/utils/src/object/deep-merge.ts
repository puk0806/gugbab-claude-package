import { isPlainObject } from '../guard/is-plain-object';

type PlainRecord = Record<string, unknown>;

function mergeInto(target: PlainRecord, source: PlainRecord): PlainRecord {
  for (const key of Object.keys(source)) {
    // Block prototype pollution vectors.
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      target[key] = mergeInto({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }
  return target;
}

/**
 * Recursively merges own enumerable plain-object properties from sources into
 * a new object. Arrays, class instances, Maps, Sets, etc. are replaced, not merged.
 */
export function deepMerge<T extends PlainRecord, S extends PlainRecord>(
  target: T,
  source: S,
): T & S;
export function deepMerge(target: PlainRecord, source: PlainRecord): PlainRecord {
  return mergeInto({ ...target }, source);
}
