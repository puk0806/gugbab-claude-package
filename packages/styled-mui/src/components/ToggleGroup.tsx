import {
  ToggleGroup as Headless,
  type ToggleGroupItemProps,
  type ToggleGroupRootProps,
} from '@gugbab/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type ToggleGroupSize = 'sm' | 'md';
export type ToggleGroupVariant = 'default' | 'outline';

export type ToggleGroupRootStyledProps = ToggleGroupRootProps & {
  size?: ToggleGroupSize;
  variant?: ToggleGroupVariant;
  className?: string;
};

const Root = forwardRef<HTMLDivElement, ToggleGroupRootStyledProps>(
  function ToggleGroupRoot(props, ref) {
    const { size = 'md', variant = 'default', className, ...rest } = props;
    return (
      <Headless.Root
        ref={ref}
        className={cn(
          'gmui-toggle-group',
          `gmui-toggle-group--${size}`,
          `gmui-toggle-group--${variant}`,
          className,
        )}
        {...(rest as ToggleGroupRootProps)}
      />
    );
  },
);

const Item = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-toggle-group__item', className)} {...rest} />;
});

export const ToggleGroup = { Root, Item };
