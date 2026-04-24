import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';
import { useLatestRef } from '../ref/use-latest-ref';

export interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

/**
 * Unifies controlled and uncontrolled state — the standard headless pattern
 * found in Radix / Ark / React Aria. If `value` is provided, the hook is in
 * controlled mode and `onChange` is emitted on setter calls (internal state
 * is not updated). If `value` is undefined, internal state is used with
 * `defaultValue` as the seed.
 *
 * The returned setter has a stable identity across renders, making it safe to
 * pass to memoized children or effect dependencies.
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;

  const [internal, setInternal] = useState<T>(defaultValue as T);
  const current = (isControlled ? value : internal) as T;

  const ctxRef = useLatestRef({ isControlled, value, onChange });

  const setter = useCallback<Dispatch<SetStateAction<T>>>(
    (update) => {
      const resolve = (prev: T): T =>
        typeof update === 'function' ? (update as (p: T) => T)(prev) : update;

      const ctx = ctxRef.current;
      if (ctx.isControlled) {
        const next = resolve(ctx.value as T);
        ctx.onChange?.(next);
      } else {
        setInternal((prev) => {
          const next = resolve(prev);
          ctx.onChange?.(next);
          return next;
        });
      }
    },
    [ctxRef],
  );

  return [current, setter];
}
