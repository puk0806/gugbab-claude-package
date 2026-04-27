import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useContext,
} from 'react';
import { Separator, type SeparatorProps } from '../../primitives/Separator/Separator';
import { Slot } from '../../primitives/Slot/Slot';
import { type Direction, useDirection } from '../../shared/DirectionProvider';
import {
  ToggleGroup,
  type ToggleGroupItemProps,
  type ToggleGroupRootProps,
} from '../../stateful/ToggleGroup';

type Orientation = 'horizontal' | 'vertical';

interface ToolbarContextValue {
  orientation: Orientation;
  dir: Direction;
}
const ToolbarContext = createContext<ToolbarContextValue | null>(null);
function useToolbarContext(consumer: string) {
  const ctx = useContext(ToolbarContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Toolbar.Root>`);
  return ctx;
}

const ITEM_SELECTOR = '[data-toolbar-item]:not([disabled])';

export interface ToolbarRootProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  dir?: Direction;
  loop?: boolean;
  asChild?: boolean;
}

const Root = forwardRef<HTMLDivElement, ToolbarRootProps>(function ToolbarRoot(
  { orientation = 'horizontal', dir, loop = true, asChild, onKeyDown, ...rest },
  ref,
) {
  const direction = useDirection(dir);
  const isLtr = direction === 'ltr';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const horizontal = orientation === 'horizontal';
    const nextKey = horizontal ? (isLtr ? 'ArrowRight' : 'ArrowLeft') : 'ArrowDown';
    const prevKey = horizontal ? (isLtr ? 'ArrowLeft' : 'ArrowRight') : 'ArrowUp';
    if (![nextKey, prevKey, 'Home', 'End'].includes(e.key)) return;
    const root = e.currentTarget;
    const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
    const idx = items.indexOf(e.target as HTMLElement);
    if (idx === -1) return;
    e.preventDefault();
    const last = items.length - 1;
    let next = idx;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key === nextKey) next = idx === last ? (loop ? 0 : last) : idx + 1;
    else if (e.key === prevKey) next = idx === 0 ? (loop ? last : 0) : idx - 1;
    items[next]?.focus();
  };

  const Comp = asChild ? Slot : 'div';

  return (
    <ToolbarContext.Provider value={{ orientation, dir: direction }}>
      <Comp
        ref={ref}
        role="toolbar"
        aria-orientation={orientation}
        dir={direction}
        data-orientation={orientation}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    </ToolbarContext.Provider>
  );
});

export interface ToolbarSeparatorProps extends SeparatorProps {}

const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  function ToolbarSeparator(props, ref) {
    const ctx = useToolbarContext('Toolbar.Separator');
    // Toolbar horizontal → separator vertical (perpendicular)
    return (
      <Separator
        ref={ref}
        orientation={ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        {...props}
      />
    );
  },
);

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { asChild, type = 'button', ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} type={asChild ? undefined : type} data-toolbar-item="" {...rest} />;
});

export interface ToolbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(function ToolbarLink(
  { asChild, onKeyDown, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'a';
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    onKeyDown?.(e);
    // Space activates anchor (matching Radix behavior)
    if (!e.defaultPrevented && e.key === ' ') e.currentTarget.click();
  };
  return <Comp ref={ref} data-toolbar-item="" onKeyDown={handleKeyDown} {...rest} />;
});

export type ToolbarToggleGroupProps = ToggleGroupRootProps;

const ToolbarToggleGroup = forwardRef<HTMLDivElement, ToolbarToggleGroupProps>(
  function ToolbarToggleGroup(props, ref) {
    const ctx = useToolbarContext('Toolbar.ToggleGroup');
    // ToolbarRoot owns the keyboard navigation; the group must defer.
    return (
      <ToggleGroup.Root
        ref={ref}
        rovingFocus={false}
        orientation={ctx.orientation}
        dir={ctx.dir}
        // biome-ignore lint/suspicious/noExplicitAny: union expansion from ToggleGroupRootProps
        {...(props as any)}
      />
    );
  },
);

export interface ToolbarToggleItemProps extends ToggleGroupItemProps {}

const ToolbarToggleItem = forwardRef<HTMLButtonElement, ToolbarToggleItemProps>(
  function ToolbarToggleItem({ ...rest }, ref) {
    return <ToggleGroup.Item ref={ref} data-toolbar-item="" {...rest} />;
  },
);

export const Toolbar = {
  Root,
  Separator: ToolbarSeparator,
  Button: ToolbarButton,
  Link: ToolbarLink,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
};
