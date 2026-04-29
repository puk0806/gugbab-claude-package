import {
  FloatingPortal,
  type Placement,
  useClick,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useId,
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

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

interface PopoverContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  context: ReturnType<typeof useFloatingBase>['context'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  contentId: string;
  modal: boolean;
}

const Ctx = createContext<PopoverContextValue | null>(null);
function useCtx(consumer: string) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${consumer} must be used inside <Popover.Root>`);
  return ctx;
}

export interface PopoverRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  /** When true, interaction outside is blocked (modal popover). Default false. */
  modal?: boolean;
  children: React.ReactNode;
}

function PopoverRoot({
  open,
  defaultOpen,
  onOpenChange,
  placement,
  modal = false,
  children,
}: PopoverRootProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement,
  });

  const click = useClick(floating.context);
  // Dismissal is handled by <DismissableLayer> on Content.
  const role = useRole(floating.context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, role]);
  const contentId = useId();

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs: floating.refs,
        context: floating.context,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        contentId,
        modal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useCtx('Popover.Trigger');
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
      aria-expanded={ctx.open}
      aria-haspopup="dialog"
      aria-controls={ctx.contentId}
      data-state={ctx.open ? 'open' : 'closed'}
      {...refProps}
    />
  );
});

export interface PopoverPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: PopoverPortalProps) {
  const ctx = useCtx('Popover.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
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

const Content = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
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
  const ctx = useCtx('Popover.Content');
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
      disableOutsidePointerEvents={ctx.modal}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onDismiss={() => ctx.setOpen(false)}
    >
      <FocusScope
        asChild
        trapped={ctx.modal}
        loop
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <Comp
          ref={composeRef}
          id={ctx.contentId}
          role="dialog"
          aria-modal={ctx.modal || undefined}
          style={{ ...ctx.floatingStyles, ...style }}
          data-state={ctx.open ? 'open' : 'closed'}
          {...ctx.getFloatingProps(props)}
        />
      </FocusScope>
    </DismissableLayer>
  );
});

export interface PopoverAnchorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Anchor = forwardRef<HTMLDivElement, PopoverAnchorProps>(function PopoverAnchor(
  { asChild, ...rest },
  ref,
) {
  const ctx = useCtx('Popover.Anchor');
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={(node: HTMLDivElement | null) => {
        ctx.refs.setReference(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      {...rest}
    />
  );
});

const Close = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { onClick, type = 'button', asChild, ...rest },
  ref,
) {
  const ctx = useCtx('Popover.Close');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(false);
      }}
      {...rest}
    />
  );
});

export const Popover = { Root: PopoverRoot, Trigger, Anchor, Portal, Content, Close };
