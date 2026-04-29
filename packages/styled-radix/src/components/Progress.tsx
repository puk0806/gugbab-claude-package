import { Progress as Headless, type ProgressRootProps } from '@gugbab-ui/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

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
      className={cn('grx-progress', `grx-progress--${size}`, className)}
      {...rest}
    />
  );
});

const Indicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ProgressIndicator({ className, ...rest }, ref) {
    return (
      <Headless.Indicator
        ref={ref}
        className={cn('grx-progress__indicator', className)}
        {...rest}
      />
    );
  },
);

export const Progress = { Root, Indicator };
