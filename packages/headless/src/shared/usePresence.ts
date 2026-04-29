import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Defers unmount until any CSS animation/transition on the rendered element
 * completes. Mounts immediately on `present=true`. On `present=false`, stays
 * mounted while a non-zero animation/transition is running and unmounts when
 * `animationend` (or `transitionend`) fires on the node — or immediately if
 * no animation is detected.
 *
 * Wire `presenceRef` to the rendered element so the hook can observe its
 * computed style and listen for the end events.
 *
 * Usage:
 *   const { mounted, presenceRef } = usePresence(open);
 *   if (!mounted) return null;
 *   return <div ref={presenceRef} data-state={open ? 'open' : 'closed'} />;
 */
export function usePresence<T extends HTMLElement = HTMLElement>(
  present: boolean,
): { mounted: boolean; presenceRef: RefObject<T | null> } {
  const [mounted, setMounted] = useState(present);
  const presenceRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    if (present) setMounted(true);
  }, [present]);

  useEffect(() => {
    if (present || !mounted) return;
    const node = presenceRef.current;
    if (!node) {
      setMounted(false);
      return;
    }

    const styles = window.getComputedStyle(node);
    const hasAnimation =
      styles.animationName !== 'none' && parseFloat(styles.animationDuration) > 0;
    const hasTransition = parseFloat(styles.transitionDuration) > 0;

    if (!hasAnimation && !hasTransition) {
      setMounted(false);
      return;
    }

    const handler = (event: Event) => {
      if (event.target === node) setMounted(false);
    };

    node.addEventListener('animationend', handler);
    node.addEventListener('animationcancel', handler);
    node.addEventListener('transitionend', handler);
    node.addEventListener('transitioncancel', handler);

    return () => {
      node.removeEventListener('animationend', handler);
      node.removeEventListener('animationcancel', handler);
      node.removeEventListener('transitionend', handler);
      node.removeEventListener('transitioncancel', handler);
    };
  }, [present, mounted]);

  return { mounted, presenceRef };
}
