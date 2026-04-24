import { type RefObject, useEffect } from 'react';
import { useLatestRef } from '../ref/use-latest-ref';

/**
 * Fires `handler` when a `mousedown` event occurs outside the given ref
 * element. Pass `enabled = false` to temporarily disable (e.g. when the
 * overlay is closed). Listener is attached to `document`.
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
  enabled = true,
): void {
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(event.target as Node)) return;
      handlerRef.current(event);
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [enabled, ref, handlerRef]);
}
