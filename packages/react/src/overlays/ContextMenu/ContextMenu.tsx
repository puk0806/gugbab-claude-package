import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  safePolygon,
  useClick,
  useClientPoint,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { usePresence } from '../../shared/usePresence';
import { useFloatingBase } from '../_floatingBase';

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloating>['refs'];
  context: ReturnType<typeof useFloating>['context'];
  floatingStyles: ReturnType<typeof useFloating>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  listRef: React.RefObject<Array<HTMLElement | null>>;
  activeIndex: number | null;
  setCoords: (p: { x: number; y: number }) => void;
  contentId: string;
}

const Ctx = createContext<ContextMenuContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <ContextMenu.Root>`);
  return ctx;
};

export interface ContextMenuRootProps {
  children: React.ReactNode;
}

function ContextMenuRoot({ children }: ContextMenuRootProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    defaultValue: false,
  });
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (v) => {
      setOpen(v);
      if (!v) setCoords(null);
    },
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
  });

  const clientPoint = useClientPoint(context, coords ?? undefined);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    clientPoint,
    dismiss,
    role,
    listNav,
  ]);
  const contentId = useId();

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs,
        context,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        listRef,
        activeIndex,
        setCoords,
        contentId,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

const Trigger = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ContextMenuTrigger({ onContextMenu, ...rest }, ref) {
    const ctx = useCtx('ContextMenu.Trigger');
    const handleContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
      onContextMenu?.(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      ctx.setCoords({ x: e.clientX, y: e.clientY });
      ctx.setOpen(true);
    };
    return (
      <div
        ref={(node) => {
          ctx.refs.setReference(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-state={ctx.open ? 'open' : 'closed'}
        onContextMenu={handleContextMenu}
        {...ctx.getReferenceProps(rest)}
      />
    );
  },
);

export interface ContextMenuPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: ContextMenuPortalProps) {
  const ctx = useCtx('ContextMenu.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

export interface ContextMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

const Content = forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
  { forceMount, style, ...props },
  ref,
) {
  const ctx = useCtx('ContextMenu.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;
  return (
    <FloatingFocusManager context={ctx.context} modal={false}>
      <div
        ref={(node) => {
          ctx.refs.setFloating(node);
          presenceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        id={ctx.contentId}
        style={{ ...ctx.floatingStyles, ...style }}
        data-state={ctx.open ? 'open' : 'closed'}
        {...ctx.getFloatingProps(props)}
      />
    </FloatingFocusManager>
  );
});

export interface ContextMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: () => void;
}

const Item = forwardRef<HTMLButtonElement, ContextMenuItemProps>(function ContextMenuItem(
  { onSelect, onClick, type = 'button', disabled, ...rest },
  ref,
) {
  const ctx = useCtx('ContextMenu.Item');
  return (
    <button
      ref={(node) => {
        if (node) {
          const idx = ctx.listRef.current.indexOf(node);
          if (idx === -1) ctx.listRef.current.push(node);
        }
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      type={type}
      role="menuitem"
      disabled={disabled}
      {...ctx.getItemProps({
        ...rest,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (!e.defaultPrevented && !disabled) {
            onSelect?.();
            ctx.setOpen(false);
          }
        },
      })}
    />
  );
});

/* -------------------------------------------------------------------------------------------------
 * Sub (nested context submenu)
 * -----------------------------------------------------------------------------------------------*/

interface ContextMenuSubContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  context: ReturnType<typeof useFloatingBase>['context'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  parent: ContextMenuContextValue;
}
const SubCtx = createContext<ContextMenuSubContextValue | null>(null);
const useSubCtx = (n: string) => {
  const c = useContext(SubCtx);
  if (!c) throw new Error(`${n} must be used inside <ContextMenu.Sub>`);
  return c;
};

export interface ContextMenuSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function Sub({ open, defaultOpen, onOpenChange, children }: ContextMenuSubProps) {
  const parent = useCtx('ContextMenu.Sub');
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement: 'right-start',
  });

  const hover = useHover(floating.context, {
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(floating.context, {
    event: 'mousedown',
    toggle: false,
    ignoreMouse: true,
  });
  const dismiss = useDismiss(floating.context, { bubbles: true });
  const role = useRole(floating.context, { role: 'menu' });
  const listNav = useListNavigation(floating.context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    nested: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    dismiss,
    role,
    listNav,
  ]);

  useEffect(() => {
    if (!parent.open && isOpen) setOpen(false);
  }, [parent.open, isOpen, setOpen]);

  return (
    <SubCtx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs: floating.refs,
        context: floating.context,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        parent,
      }}
    >
      {children}
    </SubCtx.Provider>
  );
}

export interface ContextMenuSubTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SubTrigger = forwardRef<HTMLButtonElement, ContextMenuSubTriggerProps>(
  function ContextMenuSubTrigger(
    { asChild, type = 'button', disabled, onKeyDown, children, ...rest },
    ref,
  ) {
    const sub = useSubCtx('ContextMenu.SubTrigger');
    const Comp = asChild ? Slot : 'button';
    const setRef = (node: HTMLButtonElement | null) => {
      sub.refs.setReference(node);
      // also register in parent listRef so parent keyboard nav reaches the trigger
      if (node) {
        const list = sub.parent.listRef.current;
        if (!list.includes(node)) list.push(node);
      }
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        sub.setOpen(true);
      }
    };
    const merged = sub.getReferenceProps({
      ...sub.parent.getItemProps({ ...rest }),
    }) as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <Comp
        ref={setRef}
        type={asChild ? undefined : type}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub.open}
        data-state={sub.open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        {...merged}
      >
        {children}
      </Comp>
    );
  },
);

export interface ContextMenuSubContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

const SubContent = forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  function ContextMenuSubContent({ forceMount, style, ...props }, ref) {
    const sub = useSubCtx('ContextMenu.SubContent');
    const { mounted, presenceRef } = usePresence<HTMLDivElement>(sub.open);
    if (!mounted && !forceMount) return null;
    return (
      <FloatingFocusManager context={sub.context} modal={false} initialFocus={-1}>
        <div
          ref={(node) => {
            sub.refs.setFloating(node);
            presenceRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          style={{ ...sub.floatingStyles, ...style }}
          data-state={sub.open ? 'open' : 'closed'}
          {...sub.getFloatingProps(props)}
        />
      </FloatingFocusManager>
    );
  },
);

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger,
  Portal,
  Content,
  Item,
  Sub,
  SubTrigger,
  SubContent,
};
