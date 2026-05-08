import {
  type ContextMenuContentProps,
  type ContextMenuItemProps,
  type ContextMenuPortalProps,
  type ContextMenuRootProps,
  type ContextMenuSubContentProps,
  type ContextMenuSubProps,
  type ContextMenuSubTriggerProps,
  ContextMenu as Headless,
} from '@gugbab/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

const Content = forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
  { className, ...rest },
  ref,
) {
  return <Headless.Content ref={ref} className={cn('gmui-menu__content', className)} {...rest} />;
});

const Item = forwardRef<HTMLButtonElement, ContextMenuItemProps>(function ContextMenuItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-menu__item', className)} {...rest} />;
});

const SubTrigger = forwardRef<HTMLButtonElement, ContextMenuSubTriggerProps>(
  function ContextMenuSubTrigger({ className, ...rest }, ref) {
    return (
      <Headless.SubTrigger
        ref={ref}
        className={cn('gmui-menu__item gmui-menu__item--sub-trigger', className)}
        {...rest}
      />
    );
  },
);

const SubContent = forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  function ContextMenuSubContent({ className, ...rest }, ref) {
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
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuPortalProps,
  ContextMenuRootProps,
  ContextMenuSubContentProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
};

export const ContextMenu = {
  Root: Headless.Root,
  Trigger: Headless.Trigger,
  Portal: Headless.Portal,
  Content,
  Item,
  Sub: Headless.Sub,
  SubTrigger,
  SubContent,
};
