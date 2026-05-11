import { Progress as Headless, type ProgressRootProps } from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef, type HTMLAttributes } from 'react';

export type ProgressSize = 'sm' | 'md';

export interface StyledProgressRootProps extends ProgressRootProps {
  size?: ProgressSize;
}

const Root = forwardRef<HTMLDivElement, StyledProgressRootProps>(function ProgressRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('gmui-progress', `gmui-progress--${size}`, className)}
      {...rest}
    />
  );
});

const Indicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ProgressIndicator({ className, ...rest }, ref) {
    return (
      <Headless.Indicator
        ref={ref}
        className={cn('gmui-progress__indicator', className)}
        {...rest}
      />
    );
  },
);

export const Progress = { Root, Indicator };
