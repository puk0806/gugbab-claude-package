import { forwardRef, type HTMLAttributes, type LiHTMLAttributes } from 'react';

export interface BreadcrumbsRootProps extends HTMLAttributes<HTMLElement> {
  /** aria-label for the nav wrapper. Default: "breadcrumbs". */
  label?: string;
}

const Root = forwardRef<HTMLElement, BreadcrumbsRootProps>(function BreadcrumbsRoot(
  { label = 'breadcrumbs', ...rest },
  ref,
) {
  return <nav ref={ref} aria-label={label} {...rest} />;
});

const List = forwardRef<HTMLOListElement, HTMLAttributes<HTMLOListElement>>(
  function BreadcrumbsList(props, ref) {
    return <ol ref={ref} {...props} />;
  },
);

export interface BreadcrumbsItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Marks the last item in the trail (typically the current page). */
  current?: boolean;
}

const Item = forwardRef<HTMLLIElement, BreadcrumbsItemProps>(function BreadcrumbsItem(
  { current, ...rest },
  ref,
) {
  return <li ref={ref} aria-current={current ? 'page' : undefined} {...rest} />;
});

const Link = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function BreadcrumbsLink(props, ref) {
    return <a ref={ref} {...props} />;
  },
);

const Separator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function BreadcrumbsSeparator(props, ref) {
    return <span ref={ref} role="presentation" aria-hidden {...props} />;
  },
);

const Page = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function BreadcrumbsPage(props, ref) {
    return <span ref={ref} aria-current="page" {...props} />;
  },
);

export const Breadcrumbs = { Root, List, Item, Link, Separator, Page };
