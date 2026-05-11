import {
  Toolbar as Headless,
  type ToolbarButtonProps,
  type ToolbarLinkProps,
  type ToolbarRootProps,
  type ToolbarSeparatorProps,
  type ToolbarToggleGroupProps,
  type ToolbarToggleItemProps,
} from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef } from 'react';

const Root = forwardRef<HTMLDivElement, ToolbarRootProps>(function ToolbarRoot(
  { className, ...rest },
  ref,
) {
  return <Headless.Root ref={ref} className={cn('grx-toolbar', className)} {...rest} />;
});

const Button = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { className, ...rest },
  ref,
) {
  return <Headless.Button ref={ref} className={cn('grx-toolbar__button', className)} {...rest} />;
});

const Link = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(function ToolbarLink(
  { className, ...rest },
  ref,
) {
  return <Headless.Link ref={ref} className={cn('grx-toolbar__link', className)} {...rest} />;
});

const Separator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(function ToolbarSeparator(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Separator ref={ref} className={cn('grx-toolbar__separator', className)} {...rest} />
  );
});

const ToggleGroup = forwardRef<HTMLDivElement, ToolbarToggleGroupProps>(function ToolbarToggleGroup(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.ToggleGroup
      ref={ref}
      className={cn('grx-toolbar__toggle-group', className)}
      {...(rest as ToolbarToggleGroupProps)}
    />
  );
});

const ToggleItem = forwardRef<HTMLButtonElement, ToolbarToggleItemProps>(function ToolbarToggleItem(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.ToggleItem
      ref={ref}
      className={cn('grx-toolbar__toggle-item', className)}
      {...rest}
    />
  );
});

export const Toolbar = { Root, Button, Link, Separator, ToggleGroup, ToggleItem };
