import { useControllableState, useIsomorphicLayoutEffect, useMergedRefs } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

interface NavigationMenuContextValue {
  value: string;
  setValue: (v: string) => void;
  orientation: 'horizontal' | 'vertical';
}
const Ctx = createContext<NavigationMenuContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <NavigationMenu.Root>`);
  return ctx;
};

interface NavigationMenuItemContextValue {
  value: string;
  /** The trigger's rendered id — the consumer's `id` if given, else a generated one. */
  triggerId: string;
  defaultTriggerId: string;
  setTriggerId: (id: string) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
  open: boolean;
}
const ItemCtx = createContext<NavigationMenuItemContextValue | null>(null);
const useItem = (n: string) => {
  const ctx = useContext(ItemCtx);
  if (!ctx) throw new Error(`${n} must be used inside <NavigationMenu.Item>`);
  return ctx;
};

export interface NavigationMenuRootProps extends HTMLAttributes<HTMLElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

const Root = forwardRef<HTMLElement, NavigationMenuRootProps>(function NavigationMenuRoot(
  { value, defaultValue, onValueChange, orientation = 'horizontal', ...rest },
  ref,
) {
  const [current, setValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const ctxValue = useMemo(
    () => ({ value: current, setValue, orientation }),
    [current, setValue, orientation],
  );
  return (
    <Ctx.Provider value={ctxValue}>
      <nav ref={ref} aria-label="Main" data-orientation={orientation} {...rest} />
    </Ctx.Provider>
  );
});

const List = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function NavigationMenuList(props, ref) {
    const ctx = useCtx('NavigationMenu.List');
    return <ul ref={ref} data-orientation={ctx.orientation} {...props} />;
  },
);

export interface NavigationMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  value: string;
  children: ReactNode;
}

const Item = forwardRef<HTMLLIElement, NavigationMenuItemProps>(function NavigationMenuItem(
  { value, children, onKeyDown, ...rest },
  ref,
) {
  const ctx = useCtx('NavigationMenu.Item');
  const open = ctx.value === value;
  const generatedTriggerId = useId();
  const [triggerId, setTriggerId] = useState(generatedTriggerId);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentId = useId();
  const itemCtxValue = useMemo(
    () => ({
      value,
      triggerId,
      defaultTriggerId: generatedTriggerId,
      setTriggerId,
      triggerRef,
      contentId,
      open,
    }),
    [value, triggerId, generatedTriggerId, contentId, open],
  );
  return (
    <ItemCtx.Provider value={itemCtxValue}>
      <li
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || e.key !== 'Escape' || !open) return;
          // APG disclosure navigation: Escape closes the open submenu and
          // returns focus to its trigger.
          // Handled here — don't let an enclosing Dialog/Popover close too.
          e.preventDefault();
          e.stopPropagation();
          ctx.setValue('');
          triggerRef.current?.focus();
        }}
        {...rest}
      >
        {children}
      </li>
    </ItemCtx.Provider>
  );
});

const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function NavigationMenuTrigger({ onClick, type = 'button', id: idProp, ...rest }, ref) {
    const nav = useCtx('NavigationMenu.Trigger');
    const item = useItem('NavigationMenu.Trigger');
    const setRef = useMergedRefs<HTMLButtonElement>(item.triggerRef, ref);
    // Same default as Item's initial triggerId, so server HTML is consistent.
    const id = idProp ?? item.defaultTriggerId;
    const { setTriggerId } = item;
    // Content's aria-labelledby must point at the id actually rendered. Setting the
    // same string again is a no-op, so this cannot loop.
    // Isomorphic: no SSR warning on React 18 (useLayoutEffect is a no-op there).
    useIsomorphicLayoutEffect(() => setTriggerId(id), [id, setTriggerId]);
    return (
      <button
        ref={setRef}
        type={type}
        id={id}
        aria-controls={item.contentId}
        aria-expanded={item.open}
        data-state={item.open ? 'open' : 'closed'}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) nav.setValue(item.open ? '' : item.value);
        }}
        {...rest}
      />
    );
  },
);

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function NavigationMenuContent(props, ref) {
    const item = useItem('NavigationMenu.Content');
    if (!item.open) return null;
    return (
      <div
        ref={ref}
        id={item.contentId}
        aria-labelledby={item.triggerId}
        data-state="open"
        {...props}
      />
    );
  },
);

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks the link for the current page — sets `aria-current="page"` and `data-active`. */
  active?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(function NavigationMenuLink(
  { active, ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-current={active ? 'page' : undefined}
      data-active={active ? '' : undefined}
      {...props}
    />
  );
});

export const NavigationMenu = { Root, List, Item, Trigger, Content, Link };
