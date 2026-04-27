import { forwardRef, type HTMLAttributes, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps extends HTMLAttributes<HTMLDivElement> {
  /** Target node. When `null`, the portal renders nothing. Defaults to `document.body`. */
  container?: Element | DocumentFragment | null;
}

/**
 * Renders content into a different DOM node. Hydration-safe — defers to
 * `document.body` only after mount to avoid SSR mismatch. Wraps children
 * in a `<div>` so consumers can pass standard HTML props (className, style).
 */
export const Portal = forwardRef<HTMLDivElement, PortalProps>(function Portal(props, ref) {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);
  const container =
    containerProp ?? (mounted && typeof document !== 'undefined' ? document.body : null);
  if (!container) return null;
  return createPortal(<div ref={ref} {...portalProps} />, container);
});
