import { Switch as Headless, type SwitchRootProps } from '@gugbab-ui/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface StyledSwitchRootProps extends SwitchRootProps {
  size?: SwitchSize;
}

const Root = forwardRef<HTMLButtonElement, StyledSwitchRootProps>(function SwitchRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('grx-switch', `grx-switch--${size}`, className)}
      {...rest}
    />
  );
});

const Thumb = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SwitchThumb(
  { className, ...rest },
  ref,
) {
  return <Headless.Thumb ref={ref} className={cn('grx-switch__thumb', className)} {...rest} />;
});

export const Switch = { Root, Thumb };
