import { type RefObject, useEffect } from 'react';
import { useLatestRef } from '../ref/use-latest-ref';

/**
 * Binds `handler` to `type` on `target` (default: `window`). The handler is
 * read through a latest-ref, so swapping `handler` across renders does not
 * cause the listener to be re-attached.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  target: RefObject<EventTarget | null>,
): void;
export function useEventListener(
  type: string,
  handler: (event: Event) => void,
  target?: RefObject<EventTarget | null>,
): void {
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    const el = target ? target.current : window;
    if (!el) return;

    const listener = (event: Event) => handlerRef.current(event);
    el.addEventListener(type, listener);
    return () => {
      el.removeEventListener(type, listener);
    };
  }, [type, target, handlerRef]);
}
