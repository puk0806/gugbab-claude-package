import { type CheckboxRootProps, type CheckedState, Checkbox as Headless } from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef, type HTMLAttributes } from 'react';

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
