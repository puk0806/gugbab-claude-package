import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';

/** Radix-compatible visually-hidden styles (Bootstrap pattern). */
export const VISUALLY_HIDDEN_STYLES = Object.freeze({
  position: 'absolute',
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
}) satisfies CSSProperties;

/**
 * Hides content visually while keeping it accessible to assistive technology
 * (screen readers). Based on the cross-browser "sr-only" pattern.
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function VisuallyHidden({ style, ...rest }, ref) {
    return <span ref={ref} {...rest} style={{ ...VISUALLY_HIDDEN_STYLES, ...style }} />;
  },
);
VisuallyHidden.displayName = 'VisuallyHidden';
