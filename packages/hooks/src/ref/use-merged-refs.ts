import { type Ref, type RefCallback, useCallback } from 'react';

export type RefLike<T> = Ref<T> | null | undefined;

/**
 * Merges multiple refs (callback refs, ref objects, null/undefined) into a
 * single callback ref. Use to combine forwarded refs with local refs:
 *
 * ```tsx
 * const Comp = forwardRef<HTMLDivElement>((props, forwarded) => {
 *   const local = useRef<HTMLDivElement>(null);
 *   const merged = useMergedRefs(local, forwarded);
 *   return <div ref={merged} />;
 * });
 * ```
 */
export function useMergedRefs<T>(...refs: RefLike<T>[]): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (ref == null) continue;
        if (typeof ref === 'function') {
          ref(node);
        } else {
          (ref as { current: T | null }).current = node;
        }
      }
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: rest array elements are the dependencies
    refs,
  );
}
