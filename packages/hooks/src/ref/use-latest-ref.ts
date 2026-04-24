import { type MutableRefObject, useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../lifecycle/use-isomorphic-layout-effect';

/**
 * Tracks the latest value of `value` in a ref. The ref is updated in a layout
 * effect so concurrent renders never observe a torn state.
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
