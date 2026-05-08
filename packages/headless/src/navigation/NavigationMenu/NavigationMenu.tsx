import { useControllableState } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
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
  triggerId: string;
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
  return (
    <Ctx.Provider value={{ value: current, setValue: (v) => setValue(v), orientation }}>
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
  { value, children, ...rest },
  ref,
) {
  const ctx = useCtx('NavigationMenu.Item');
  const open = ctx.value === value;
  const triggerId = useId();
  const contentId = useId();
  return (
    <ItemCtx.Provider value={{ value, triggerId, contentId, open }}>
      <li ref={ref} data-state={open ? 'open' : 'closed'} {...rest}>
        {children}
      </li>
    </ItemCtx.Provider>
  );
});

const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function NavigationMenuTrigger({ onClick, type = 'button', ...rest }, ref) {
    const nav = useCtx('NavigationMenu.Trigger');
    const item = useItem('NavigationMenu.Trigger');
    return (
      <button
        ref={ref}
        type={type}
        id={item.triggerId}
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

const Link = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function NavigationMenuLink(props, ref) {
    return <a ref={ref} {...props} />;
  },
);

export const NavigationMenu = { Root, List, Item, Trigger, Content, Link };
