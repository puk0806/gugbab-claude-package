import {
  autoUpdate,
  FloatingPortal,
  safePolygon,
  useClick,
  useClientPoint,
  useFloating,
  useHover,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { useControllableState, useMergedRefs } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import {
  DismissableLayer,
  type EscapeKeyDownEvent,
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
} from '../../shared/DismissableLayer';
import { FocusScope } from '../../shared/FocusScope';
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

  // Dismissal handled by <DismissableLayer> on Content; floating-ui only
  // provides clientPoint + role + list-nav wiring here.
  const clientPoint = useClientPoint(context, coords ?? undefined);
  const menuRole = useRole(context, { role: 'menu' });
  // The trigger is a plain region, not a button — aria-expanded/haspopup are not
  // allowed on it (Radix renders none). Keep the role wiring for menu and items only.
  const role = useMemo(
    () => ({ floating: menuRole.floating, item: menuRole.item }),
    [menuRole.floating, menuRole.item],
  );
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    clientPoint,
    role,
    listNav,
  ]);
  const contentId = useId();

  const ctxValue = useMemo<ContextMenuContextValue>(
    () => ({
      open: isOpen,
      setOpen,
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
    }),
    [
      isOpen,
      setOpen,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
      contentId,
    ],
  );

  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
}

const Trigger = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ContextMenuTrigger({ onContextMenu, ...rest }, ref) {
    const ctx = useCtx('ContextMenu.Trigger');
    const composedRef = useMergedRefs<HTMLDivElement>(ctx.refs.setReference, ref);
    const handleContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
      onContextMenu?.(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      ctx.setCoords({ x: e.clientX, y: e.clientY });
      ctx.setOpen(true);
    };
    return (
      <div
        ref={composedRef}
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
  asChild?: boolean;
  /** Cancellable. Called on `pointerdown` outside. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  /** Cancellable. Called when focus moves outside. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /** Cancellable. Called for any outside interaction (pointer or focus). */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  /** Cancellable. Called when Escape is pressed. */
  onEscapeKeyDown?: (event: EscapeKeyDownEvent) => void;
  /** Cancellable. Called when Content auto-focuses on open. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Cancellable. Called when focus is restored on close. */
  onCloseAutoFocus?: (event: Event) => void;
}

const Content = forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
  {
    forceMount,
    asChild,
    style,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onEscapeKeyDown,
    onOpenAutoFocus,
    onCloseAutoFocus,
    ...props
  },
  ref,
) {
  const ctx = useCtx('ContextMenu.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  const composeRef = useMergedRefs<HTMLDivElement>(ctx.refs.setFloating, presenceRef, ref);
  if (!mounted && !forceMount) return null;

  const Comp = asChild ? Slot : 'div';

  return (
    <DismissableLayer
      asChild
      // ContextMenu is non-modal: no outside pointer events blocking
      disableOutsidePointerEvents={false}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onDismiss={() => ctx.setOpen(false)}
    >
      <FocusScope
        asChild
        // ContextMenu is non-modal: focus is not trapped
        trapped={false}
        loop
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <Comp
          ref={composeRef}
          id={ctx.contentId}
          role="menu"
          style={{ ...ctx.floatingStyles, ...style }}
          data-state={ctx.open ? 'open' : 'closed'}
          {...ctx.getFloatingProps(props)}
        />
      </FocusScope>
    </DismissableLayer>
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
  const { listRef } = ctx;
  const registerNode = useCallback(
    (node: HTMLButtonElement | null) => {
      if (node) {
        const idx = listRef.current.indexOf(node);
        if (idx === -1) listRef.current.push(node);
      }
    },
    [listRef],
  );
  const composedRef = useMergedRefs<HTMLButtonElement>(registerNode, ref);
  return (
    <button
      ref={composedRef}
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
  // Sub dismissal handled by nested <DismissableLayer> on SubContent.
  // bubbles:true propagates Escape to the parent layer.
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
    role,
    listNav,
  ]);

  useEffect(() => {
    if (!parent.open && isOpen) setOpen(false);
  }, [parent.open, isOpen, setOpen]);

  const { refs, context, floatingStyles } = floating;
  const subCtxValue = useMemo<ContextMenuSubContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      parent,
    }),
    [
      isOpen,
      setOpen,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      parent,
    ],
  );

  return <SubCtx.Provider value={subCtxValue}>{children}</SubCtx.Provider>;
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
    const parentListRef = sub.parent.listRef;
    // also register in parent listRef so parent keyboard nav reaches the trigger
    const registerInParent = useCallback(
      (node: HTMLButtonElement | null) => {
        if (node) {
          const list = parentListRef.current;
          if (!list.includes(node)) list.push(node);
        }
      },
      [parentListRef],
    );
    const setRef = useMergedRefs<HTMLButtonElement>(sub.refs.setReference, registerInParent, ref);
    const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
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
  asChild?: boolean;
  /** Cancellable. Called on `pointerdown` outside the sub menu. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  /** Cancellable. Called when focus moves outside the sub menu. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /** Cancellable. Called for any outside interaction. */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  /** Cancellable. Called when Escape is pressed inside the sub menu. */
  onEscapeKeyDown?: (event: EscapeKeyDownEvent) => void;
  /** Cancellable. Called when SubContent auto-focuses on open. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Cancellable. Called when focus is restored on sub menu close. */
  onCloseAutoFocus?: (event: Event) => void;
}

const SubContent = forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  function ContextMenuSubContent(
    {
      forceMount,
      asChild,
      style,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onEscapeKeyDown,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) {
    const sub = useSubCtx('ContextMenu.SubContent');
    const { mounted, presenceRef } = usePresence<HTMLDivElement>(sub.open);
    const composeRef = useMergedRefs<HTMLDivElement>(sub.refs.setFloating, presenceRef, ref);
    if (!mounted && !forceMount) return null;

    const Comp = asChild ? Slot : 'div';

    return (
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={false}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={onFocusOutside}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        onDismiss={() => sub.setOpen(false)}
      >
        <FocusScope
          asChild
          trapped={false}
          loop
          onMountAutoFocus={onOpenAutoFocus}
          onUnmountAutoFocus={onCloseAutoFocus}
        >
          <Comp
            ref={composeRef}
            role="menu"
            style={{ ...sub.floatingStyles, ...style }}
            data-state={sub.open ? 'open' : 'closed'}
            {...sub.getFloatingProps(props)}
          />
        </FocusScope>
      </DismissableLayer>
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
