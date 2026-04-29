import { forwardRef, type HTMLAttributes } from 'react';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /**
   * When true, the separator is purely visual — role becomes `"none"` and
   * `aria-orientation` is omitted. Use for layout-only dividers.
   */
  decorative?: boolean;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = false, ...rest },
  ref,
) {
  // aria-orientation defaults to "horizontal" — only emit it when vertical
  const ariaOrientation = orientation === 'vertical' ? orientation : undefined;
  const semanticProps = decorative
    ? ({ role: 'none' } as const)
    : ({ role: 'separator', 'aria-orientation': ariaOrientation } as const);

  return <div ref={ref} data-orientation={orientation} {...semanticProps} {...rest} />;
});
Separator.displayName = 'Separator';
