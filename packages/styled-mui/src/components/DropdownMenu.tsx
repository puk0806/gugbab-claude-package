import {
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemIndicatorProps,
  type DropdownMenuItemProps,
  type DropdownMenuPortalProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuRootProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuSubProps,
  type DropdownMenuSubTriggerProps,
  type DropdownMenuTriggerProps,
  DropdownMenu as Headless,
} from '@gugbab/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

const Content = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  { className, ...rest },
  ref,
) {
  return <Headless.Content ref={ref} className={cn('gmui-menu__content', className)} {...rest} />;
});

const Item = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-menu__item', className)} {...rest} />;
});

const CheckboxItem = forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
  function DropdownMenuCheckboxItem({ className, ...rest }, ref) {
    return (
      <Headless.CheckboxItem
        ref={ref}
        className={cn('gmui-menu__item gmui-menu__item--checkbox', className)}
        {...rest}
      />
    );
  },
);

const RadioGroup = forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  function DropdownMenuRadioGroup({ className, ...rest }, ref) {
    return (
      <Headless.RadioGroup
        ref={ref}
        className={cn('gmui-menu__radio-group', className)}
        {...rest}
      />
    );
  },
);

const RadioItem = forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem({ className, ...rest }, ref) {
    return (
      <Headless.RadioItem
        ref={ref}
        className={cn('gmui-menu__item gmui-menu__item--radio', className)}
        {...rest}
      />
    );
  },
);

const ItemIndicator = forwardRef<HTMLSpanElement, DropdownMenuItemIndicatorProps>(
  function DropdownMenuItemIndicator({ className, ...rest }, ref) {
    return (
      <Headless.ItemIndicator
        ref={ref}
        className={cn('gmui-menu__item-indicator', className)}
        {...rest}
      />
    );
  },
);

const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator({ className, ...rest }, ref) {
    return (
      <Headless.Separator ref={ref} className={cn('gmui-menu__separator', className)} {...rest} />
    );
  },
);

const Label = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DropdownMenuLabel(
  { className, ...rest },
  ref,
) {
  return <Headless.Label ref={ref} className={cn('gmui-menu__label', className)} {...rest} />;
});

const SubTrigger = forwardRef<HTMLButtonElement, DropdownMenuSubTriggerProps>(
  function DropdownMenuSubTrigger({ className, ...rest }, ref) {
    return (
      <Headless.SubTrigger
        ref={ref}
        className={cn('gmui-menu__item gmui-menu__item--sub-trigger', className)}
        {...rest}
      />
    );
  },
);

const SubContent = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function DropdownMenuSubContent({ className, ...rest }, ref) {
    return (
      <Headless.SubContent
        ref={ref}
        className={cn('gmui-menu__content gmui-menu__sub-content', className)}
        {...rest}
      />
    );
  },
);

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemIndicatorProps,
  DropdownMenuItemProps,
  DropdownMenuPortalProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuRootProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
};

export const DropdownMenu = {
  Root: Headless.Root,
  Trigger: Headless.Trigger,
  Portal: Headless.Portal,
  Content,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Label,
  Sub: Headless.Sub,
  SubTrigger,
  SubContent,
};
