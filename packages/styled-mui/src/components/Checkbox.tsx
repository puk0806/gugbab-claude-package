import {
  type CheckboxRootProps,
  type CheckedState,
  Checkbox as Headless,
} from '@gugbab-ui/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface StyledCheckboxRootProps extends CheckboxRootProps {
  size?: CheckboxSize;
}

const Root = forwardRef<HTMLButtonElement, StyledCheckboxRootProps>(function CheckboxRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('gmui-checkbox', `gmui-checkbox--${size}`, className)}
      {...rest}
    />
  );
});

const Indicator = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }
>(function CheckboxIndicator({ className, ...rest }, ref) {
  return (
    <Headless.Indicator ref={ref} className={cn('gmui-checkbox__indicator', className)} {...rest} />
  );
});

export type { CheckedState };
export const Checkbox = { Root, Indicator };
