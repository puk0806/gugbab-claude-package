import {
  Menubar as Headless,
  type MenubarCheckboxItemProps,
  type MenubarContentProps,
  type MenubarItemIndicatorProps,
  type MenubarItemProps,
  type MenubarMenuProps,
  type MenubarPortalProps,
  type MenubarRadioGroupProps,
  type MenubarRadioItemProps,
  type MenubarRootProps,
  type MenubarSubContentProps,
  type MenubarSubProps,
  type MenubarSubTriggerProps,
  type MenubarTriggerProps,
} from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef, type HTMLAttributes } from 'react';

const Root = forwardRef<HTMLDivElement, MenubarRootProps>(function MenubarRoot(
  { className, ...rest },
  ref,
) {
  return <Headless.Root ref={ref} className={cn('grx-menubar', className)} {...rest} />;
});

const Trigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { className, ...rest },
  ref,
) {
  return <Headless.Trigger ref={ref} className={cn('grx-menubar__trigger', className)} {...rest} />;
});

const Content = forwardRef<HTMLDivElement, MenubarContentProps>(function MenubarContent(
  { className, ...rest },
  ref,
) {
  return <Headless.Content ref={ref} className={cn('grx-menu__content', className)} {...rest} />;
});

const Item = forwardRef<HTMLButtonElement, MenubarItemProps>(function MenubarItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('grx-menu__item', className)} {...rest} />;
});

const CheckboxItem = forwardRef<HTMLButtonElement, MenubarCheckboxItemProps>(
  function MenubarCheckboxItem({ className, ...rest }, ref) {
    return (
      <Headless.CheckboxItem
        ref={ref}
        className={cn('grx-menu__item grx-menu__item--checkbox', className)}
        {...rest}
      />
    );
  },
);

const RadioGroup = forwardRef<HTMLDivElement, MenubarRadioGroupProps>(function MenubarRadioGroup(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.RadioGroup ref={ref} className={cn('grx-menu__radio-group', className)} {...rest} />
  );
});

const RadioItem = forwardRef<HTMLButtonElement, MenubarRadioItemProps>(function MenubarRadioItem(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.RadioItem
      ref={ref}
      className={cn('grx-menu__item grx-menu__item--radio', className)}
      {...rest}
    />
  );
});

const ItemIndicator = forwardRef<HTMLSpanElement, MenubarItemIndicatorProps>(
  function MenubarItemIndicator({ className, ...rest }, ref) {
    return (
      <Headless.ItemIndicator
        ref={ref}
        className={cn('grx-menu__item-indicator', className)}
        {...rest}
      />
    );
  },
);

const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MenubarSeparator({ className, ...rest }, ref) {
    return (
      <Headless.Separator ref={ref} className={cn('grx-menu__separator', className)} {...rest} />
    );
  },
);

const Label = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function MenubarLabel(
  { className, ...rest },
  ref,
) {
  return <Headless.Label ref={ref} className={cn('grx-menu__label', className)} {...rest} />;
});

const SubTrigger = forwardRef<HTMLButtonElement, MenubarSubTriggerProps>(function MenubarSubTrigger(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.SubTrigger
      ref={ref}
      className={cn('grx-menu__item grx-menu__item--sub-trigger', className)}
      {...rest}
    />
  );
});

const SubContent = forwardRef<HTMLDivElement, MenubarSubContentProps>(function MenubarSubContent(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.SubContent
      ref={ref}
      className={cn('grx-menu__content grx-menu__sub-content', className)}
      {...rest}
    />
  );
});

export type {
  MenubarCheckboxItemProps,
  MenubarContentProps,
  MenubarItemIndicatorProps,
  MenubarItemProps,
  MenubarMenuProps,
  MenubarPortalProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarRootProps,
  MenubarSubContentProps,
  MenubarSubProps,
  MenubarSubTriggerProps,
  MenubarTriggerProps,
};

export const Menubar = {
  Root,
  Menu: Headless.Menu,
  Trigger,
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
