import { forwardRef, type HTMLAttributes } from 'react';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Target aspect ratio, expressed as width / height (e.g., 16 / 9). Default `1 / 1`. */
  ratio?: number;
}

/**
 * Preserves a given aspect ratio for its content. Uses the padding-bottom
 * technique for full browser support — outer wrapper has the calculated
 * padding, inner element fills it absolutely.
 *
 * DOM:
 *   <div data-aspect-ratio-wrapper style="position:relative; width:100%; padding-bottom:N%">
 *     <div style="position:absolute; inset:0">{children}</div>
 *   </div>
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 1 / 1, style, ...rest },
  ref,
) {
  return (
    <div
      data-aspect-ratio-wrapper=""
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: `${100 / ratio}%`,
      }}
    >
      <div
        ref={ref}
        {...rest}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          ...style,
        }}
      />
    </div>
  );
});
