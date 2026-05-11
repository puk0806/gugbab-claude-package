import { Separator as HeadlessSeparator, type SeparatorProps } from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef } from 'react';

export interface StyledSeparatorProps extends SeparatorProps {}

export const Separator = forwardRef<HTMLDivElement, StyledSeparatorProps>(function Separator(
  { className, orientation = 'horizontal', ...rest },
  ref,
) {
  return (
    <HeadlessSeparator
      ref={ref}
      orientation={orientation}
      className={cn('gmui-separator', `gmui-separator--${orientation}`, className)}
      {...rest}
    />
  );
});
