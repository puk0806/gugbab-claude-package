export function groupBy<T, K extends PropertyKey>(
    array: readonly T[],
    keyFn: (item: T, index: number) => K,
): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    array.forEach((item, index) => {
        const key = keyFn(item, index);
        // Own-property check (not Object.hasOwn — ES2022, missing in Safari < 15.4):
        // inherited members (toString, constructor, …)
        // must not be mistaken for an existing bucket.
        // biome-ignore lint/suspicious/noPrototypeBuiltins: Object.hasOwn is ES2022 (Safari < 15.4 lacks it); this util targets older runtimes too
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            result[key].push(item);
        } else {
            // defineProperty: plain assignment to "__proto__" would replace the
            // prototype instead of creating a key.
            Object.defineProperty(result, key, { value: [item], writable: true, enumerable: true, configurable: true });
        }
    });
    return result;
}
