import {
  FloatingPortal,
  type Placement,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import {
  DismissableLayer,
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
} from '../../shared/DismissableLayer';
import { FocusScope } from '../../shared/FocusScope';
import { usePresence } from '../../shared/usePresence';
import { useFloatingBase } from '../_floatingBase';

/* -------------------------------------------------------------------------------------------------
 * Tooltip Provider — shared delay / skip-delay across siblings (Radix parity)
 * -----------------------------------------------------------------------------------------------*/

interface TooltipProviderContextValue {
  delayDuration: number;
  skipDelayDuration: number;
  isOpenDelayedRef: React.RefObject<boolean>;
  onOpen: () => void;
  onClose: () => void;
  disableHoverableContent: boolean;
}
const ProviderCtx = createContext<TooltipProviderContextValue | null>(null);

export interface TooltipProviderProps {
  children: ReactNode;
  /** ms before opening on hover. Default 700. */
  delayDuration?: number;
  /** Window within which subsequent triggers open without delay. Default 300. */
  skipDelayDuration?: number;
  /** When true, hovering the tooltip content closes it. */
  disableHoverableContent?: boolean;
}

const TooltipProvider = ({
  children,
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent = false,
}: TooltipProviderProps) => {
  const isOpenDelayedRef = useRef(true);
  const skipDelayTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (skipDelayTimerRef.current) window.clearTimeout(skipDelayTimerRef.current);
    },
    [],
  );

  const onOpen = () => {
    if (skipDelayTimerRef.current) window.clearTimeout(skipDelayTimerRef.current);
    isOpenDelayedRef.current = false;
  };
  const onClose = () => {
    if (skipDelayTimerRef.current) window.clearTimeout(skipDelayTimerRef.current);
    skipDelayTimerRef.current = window.setTimeout(() => {
      isOpenDelayedRef.current = true;
    }, skipDelayDuration);
  };

  return (
    <ProviderCtx.Provider
      value={{
        delayDuration,
        skipDelayDuration,
        isOpenDelayedRef,
        onOpen,
        onClose,
        disableHoverableContent,
      }}
    >
      {children}
    </ProviderCtx.Provider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  asChild?: boolean;
  /** Cancellable. Called on `pointerdown` outside. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  /** Cancellable. Called when focus moves outside. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /** Cancellable. Called for any outside interaction (pointer or focus). */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  /** Cancellable. Called when Escape is pressed. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Cancellable. Called when Content auto-focuses on open. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Cancellable. Called when focus is restored on close. */
  onCloseAutoFocus?: (event: Event) => void;
}

export interface TooltipTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  contentId: string;
}
const Ctx = createContext<TooltipContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Tooltip.Root>`);
  return ctx;
};

export interface TooltipRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  /** ms to wait before opening on hover. Defaults to Provider's `delayDuration` or 700. */
  delayDuration?: number;
  /** When true, hovering the tooltip content closes it. */
  disableHoverableContent?: boolean;
  children: ReactNode;
}

function TooltipRoot({
  open,
  defaultOpen,
  onOpenChange,
  placement = 'top',
  delayDuration: localDelay,
  disableHoverableContent: localDisableHover,
  children,
}: TooltipRootProps) {
  const provider = useContext(ProviderCtx);
  const delay =
    localDelay ??
    (provider ? (provider.isOpenDelayedRef.current ? provider.delayDuration : 0) : 700);
  const disableHoverable = localDisableHover ?? provider?.disableHoverableContent ?? false;

  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: (next) => {
      onOpenChange?.(next);
      if (provider) {
        if (next) provider.onOpen();
        else provider.onClose();
      }
    },
  });

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement,
  });

  const hover = useHover(floating.context, {
    delay: { open: delay, close: 0 },
    move: false,
    handleClose: disableHoverable ? null : undefined,
  });
  const focus = useFocus(floating.context);
  const role = useRole(floating.context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, role]);
  const contentId = useId();

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs: floating.refs,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        contentId,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

const Trigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(function TooltipTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useCtx('Tooltip.Trigger');
  const Comp = asChild ? Slot : 'button';
  const setRef = (node: HTMLButtonElement | null) => {
    ctx.refs.setReference(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const refProps = ctx.getReferenceProps(props) as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <Comp
      ref={setRef}
      type={asChild ? undefined : 'button'}
      aria-describedby={ctx.open ? ctx.contentId : undefined}
      data-state={ctx.open ? 'open' : 'closed'}
      {...refProps}
    />
  );
});

export interface TooltipPortalProps {
  children?: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: TooltipPortalProps) {
  const ctx = useCtx('Tooltip.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

const Content = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  {
    forceMount,
    asChild,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onEscapeKeyDown,
    onOpenAutoFocus,
    onCloseAutoFocus,
    style,
    ...props
  },
  ref,
) {
  const ctx = useCtx('Tooltip.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';

  const composeRef = (node: HTMLDivElement | null) => {
    ctx.refs.setFloating(node);
    presenceRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onDismiss={() => ctx.setOpen(false)}
    >
      <FocusScope
        asChild
        trapped={false}
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <Comp
          ref={composeRef}
          id={ctx.contentId}
          role="tooltip"
          style={{ ...ctx.floatingStyles, ...style }}
          data-state={ctx.open ? 'open' : 'closed'}
          {...ctx.getFloatingProps(props)}
        />
      </FocusScope>
    </DismissableLayer>
  );
});

export const Tooltip = { Provider: TooltipProvider, Root: TooltipRoot, Trigger, Portal, Content };
