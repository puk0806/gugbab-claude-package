import {
  RadioGroup as Headless,
  type RadioGroupItemProps,
  type RadioGroupRootProps,
} from '@gugbab/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type RadioGroupSize = 'sm' | 'md';

export interface RadioGroupRootStyledProps extends RadioGroupRootProps {
  size?: RadioGroupSize;
}

const Root = forwardRef<HTMLDivElement, RadioGroupRootStyledProps>(function RadioGroupRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('grx-radio-group', `grx-radio-group--${size}`, className)}
      {...rest}
    />
  );
});

const Item = forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('grx-radio-group__item', className)} {...rest} />;
});

const Indicator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function RadioGroupIndicator({ className, ...rest }, ref) {
    return <span ref={ref} className={cn('grx-radio-group__indicator', className)} {...rest} />;
  },
);

export const RadioGroup = { Root, Item, Indicator };
