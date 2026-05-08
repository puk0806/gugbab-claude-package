import {
  NavigationMenu as Headless,
  type NavigationMenuItemProps,
  type NavigationMenuRootProps,
} from '@gugbab/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

const Root = forwardRef<HTMLElement, NavigationMenuRootProps>(function NavigationMenuRoot(
  { className, ...rest },
  ref,
) {
  return <Headless.Root ref={ref} className={cn('grx-navigation-menu', className)} {...rest} />;
});

const List = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function NavigationMenuList({ className, ...rest }, ref) {
    return (
      <Headless.List ref={ref} className={cn('grx-navigation-menu__list', className)} {...rest} />
    );
  },
);

const Item = forwardRef<HTMLLIElement, NavigationMenuItemProps>(function NavigationMenuItem(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Item ref={ref} className={cn('grx-navigation-menu__item', className)} {...rest} />
  );
});

const Trigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function NavigationMenuTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger
        ref={ref}
        className={cn('grx-navigation-menu__trigger', className)}
        {...rest}
      />
    );
  },
);

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function NavigationMenuContent({ className, ...rest }, ref) {
    return (
      <Headless.Content
        ref={ref}
        className={cn('grx-navigation-menu__content', className)}
        {...rest}
      />
    );
  },
);

const Link = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function NavigationMenuLink({ className, ...rest }, ref) {
    return (
      <Headless.Link ref={ref} className={cn('grx-navigation-menu__link', className)} {...rest} />
    );
  },
);

export const NavigationMenu = { Root, List, Item, Trigger, Content, Link };
