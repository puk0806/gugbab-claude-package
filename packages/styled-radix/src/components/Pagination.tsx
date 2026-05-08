import {
  Pagination as Headless,
  type PaginationPageProps,
  type PaginationRootProps,
} from '@gugbab/headless';
import { forwardRef, type HTMLAttributes, type LiHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type PaginationSize = 'sm' | 'md';

export interface PaginationStyledRootProps extends PaginationRootProps {
  size?: PaginationSize;
}

const Root = forwardRef<HTMLElement, PaginationStyledRootProps>(function PaginationRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('grx-pagination', `grx-pagination--${size}`, className)}
      {...rest}
    />
  );
});

const List = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function PaginationList(
  { className, ...rest },
  ref,
) {
  return <Headless.List ref={ref} className={cn('grx-pagination__list', className)} {...rest} />;
});

const Item = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function PaginationItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('grx-pagination__item', className)} {...rest} />;
});

const Page = forwardRef<HTMLButtonElement, PaginationPageProps>(function PaginationPage(
  { className, ...rest },
  ref,
) {
  return <Headless.Page ref={ref} className={cn('grx-pagination__page', className)} {...rest} />;
});

const Previous = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function PaginationPrevious({ className, ...rest }, ref) {
    return (
      <Headless.Previous ref={ref} className={cn('grx-pagination__prev', className)} {...rest} />
    );
  },
);

const Next = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function PaginationNext({ className, ...rest }, ref) {
    return <Headless.Next ref={ref} className={cn('grx-pagination__next', className)} {...rest} />;
  },
);

const Ellipsis = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function PaginationEllipsis({ className, ...rest }, ref) {
    return (
      <Headless.Ellipsis
        ref={ref}
        className={cn('grx-pagination__ellipsis', className)}
        {...rest}
      />
    );
  },
);

export const Pagination = { Root, List, Item, Page, Previous, Next, Ellipsis };
