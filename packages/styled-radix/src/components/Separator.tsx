import { Separator as HeadlessSeparator, type SeparatorProps } from '@gugbab-ui/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface StyledSeparatorProps extends SeparatorProps {}

export const Separator = forwardRef<HTMLDivElement, StyledSeparatorProps>(function Separator(
  { className, orientation = 'horizontal', ...rest },
  ref,
) {
  return (
    <HeadlessSeparator
      ref={ref}
      orientation={orientation}
      className={cn('grx-separator', `grx-separator--${orientation}`, className)}
      {...rest}
    />
  );
});
