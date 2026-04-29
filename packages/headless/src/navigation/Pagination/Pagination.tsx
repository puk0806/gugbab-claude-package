import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useMemo,
} from 'react';

interface PaginationContextValue {
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  siblingCount: number;
  boundaryCount: number;
}
const Ctx = createContext<PaginationContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Pagination.Root>`);
  return ctx;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Computes the page number sequence, inserting null for ellipsis gaps. */
function buildPageList(
  page: number,
  pageCount: number,
  siblingCount: number,
  boundaryCount: number,
): Array<number | null> {
  if (pageCount <= 0) return [];
  const startPages = range(1, Math.min(boundaryCount, pageCount));
  const endPages = range(Math.max(pageCount - boundaryCount + 1, boundaryCount + 1), pageCount);

  const siblingStart = Math.max(
    Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 && endPages[0] !== undefined ? endPages[0] - 2 : pageCount - 1,
  );

  const items: Array<number | null> = [
    ...startPages,
    ...(siblingStart > boundaryCount + 2
      ? [null]
      : boundaryCount + 1 < pageCount - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingStart, siblingEnd),
    ...(siblingEnd < pageCount - boundaryCount - 1
      ? [null]
      : pageCount - boundaryCount > boundaryCount
        ? [pageCount - boundaryCount]
        : []),
    ...endPages,
  ];

  // De-duplicate while preserving order (nulls allowed twice).
  const seen = new Set<number>();
  return items.filter((i) => {
    if (i === null) return true;
    if (seen.has(i)) return false;
    seen.add(i);
    return true;
  });
}

export interface PaginationRootProps extends HTMLAttributes<HTMLElement> {
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageCount: number;
  siblingCount?: number;
  boundaryCount?: number;
}

const Root = forwardRef<HTMLElement, PaginationRootProps>(function PaginationRoot(
  { page, defaultPage, onPageChange, pageCount, siblingCount = 1, boundaryCount = 1, ...rest },
  ref,
) {
  const [current, setPage] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage ?? 1,
    onChange: onPageChange,
  });
  return (
    <Ctx.Provider
      value={{
        page: current,
        pageCount,
        setPage: (p) => setPage(Math.max(1, Math.min(pageCount, p))),
        siblingCount,
        boundaryCount,
      }}
    >
      <nav ref={ref} aria-label="pagination" {...rest} />
    </Ctx.Provider>
  );
});

const List = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function PaginationList(props, ref) {
    return <ul ref={ref} {...props} />;
  },
);

const Item = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  function PaginationItem(props, ref) {
    return <li ref={ref} {...props} />;
  },
);

export interface PaginationPageProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  page: number;
}

const Page = forwardRef<HTMLButtonElement, PaginationPageProps>(function PaginationPage(
  { page: targetPage, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = useCtx('Pagination.Page');
  const isCurrent = ctx.page === targetPage;
  return (
    <button
      ref={ref}
      type={type}
      aria-current={isCurrent ? 'page' : undefined}
      data-current={isCurrent ? '' : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setPage(targetPage);
      }}
      {...rest}
    />
  );
});

const Previous = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function PaginationPrevious({ onClick, type = 'button', disabled, ...rest }, ref) {
    const ctx = useCtx('Pagination.Previous');
    const isDisabled = disabled ?? ctx.page <= 1;
    return (
      <button
        ref={ref}
        type={type}
        aria-label="Go to previous page"
        disabled={isDisabled}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented && !isDisabled) ctx.setPage(ctx.page - 1);
        }}
        {...rest}
      />
    );
  },
);

const Next = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function PaginationNext({ onClick, type = 'button', disabled, ...rest }, ref) {
    const ctx = useCtx('Pagination.Next');
    const isDisabled = disabled ?? ctx.page >= ctx.pageCount;
    return (
      <button
        ref={ref}
        type={type}
        aria-label="Go to next page"
        disabled={isDisabled}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented && !isDisabled) ctx.setPage(ctx.page + 1);
        }}
        {...rest}
      />
    );
  },
);

const Ellipsis = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function PaginationEllipsis(props, ref) {
    return <span ref={ref} aria-hidden {...props} />;
  },
);

/** Render-prop helper for consumers who want the computed page sequence. */
export function usePaginationPages() {
  const ctx = useCtx('usePaginationPages');
  return useMemo(
    () => buildPageList(ctx.page, ctx.pageCount, ctx.siblingCount, ctx.boundaryCount),
    [ctx.page, ctx.pageCount, ctx.siblingCount, ctx.boundaryCount],
  );
}

export const Pagination = { Root, List, Item, Page, Previous, Next, Ellipsis };
