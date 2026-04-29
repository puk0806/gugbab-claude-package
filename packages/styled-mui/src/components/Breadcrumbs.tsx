import {
  type BreadcrumbsItemProps,
  type BreadcrumbsRootProps,
  Breadcrumbs as Headless,
} from '@gugbab-ui/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type BreadcrumbsSeparatorVariant = 'chevron' | 'slash';

export interface BreadcrumbsStyledRootProps extends BreadcrumbsRootProps {
  separator?: BreadcrumbsSeparatorVariant;
}

const Root = forwardRef<HTMLElement, BreadcrumbsStyledRootProps>(function BreadcrumbsRoot(
  { separator = 'chevron', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('gmui-breadcrumbs', `gmui-breadcrumbs--${separator}`, className)}
      {...rest}
    />
  );
});

const List = forwardRef<HTMLOListElement, HTMLAttributes<HTMLOListElement>>(
  function BreadcrumbsList({ className, ...rest }, ref) {
    return (
      <Headless.List ref={ref} className={cn('gmui-breadcrumbs__list', className)} {...rest} />
    );
  },
);

const Item = forwardRef<HTMLLIElement, BreadcrumbsItemProps>(function BreadcrumbsItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-breadcrumbs__item', className)} {...rest} />;
});

const Link = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function BreadcrumbsLink({ className, ...rest }, ref) {
    return (
      <Headless.Link ref={ref} className={cn('gmui-breadcrumbs__link', className)} {...rest} />
    );
  },
);

const Separator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function BreadcrumbsSeparator({ className, children, ...rest }, ref) {
    return (
      <Headless.Separator
        ref={ref}
        className={cn('gmui-breadcrumbs__separator', className)}
        {...rest}
      >
        {children}
      </Headless.Separator>
    );
  },
);

const Page = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function BreadcrumbsPage(
  { className, ...rest },
  ref,
) {
  return <Headless.Page ref={ref} className={cn('gmui-breadcrumbs__page', className)} {...rest} />;
});

export const Breadcrumbs = { Root, List, Item, Link, Separator, Page };
