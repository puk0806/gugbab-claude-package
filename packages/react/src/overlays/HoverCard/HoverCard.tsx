import {
  FloatingPortal,
  type Placement,
  safePolygon,
  useDismiss,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type AnchorHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useId,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { usePresence } from '../../shared/usePresence';
import { useFloatingBase } from '../_floatingBase';

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

export interface HoverCardTriggerProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

interface HoverCardContextValue {
  open: boolean;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  contentId: string;
}
const Ctx = createContext<HoverCardContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <HoverCard.Root>`);
  return ctx;
};

export interface HoverCardRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  openDelay?: number;
  closeDelay?: number;
  children: React.ReactNode;
}

function HoverCardRoot({
  open,
  defaultOpen,
  onOpenChange,
  placement = 'bottom',
  openDelay = 700,
  closeDelay = 300,
  children,
}: HoverCardRootProps) {
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

  const hover = useHover(floating.context, {
    delay: { open: openDelay, close: closeDelay },
    handleClose: safePolygon(),
  });
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);
  const contentId = useId();

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
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

const Trigger = forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(function HoverCardTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useCtx('HoverCard.Trigger');
  const Comp = asChild ? Slot : 'a';
  const setRef = (node: HTMLAnchorElement | null) => {
    ctx.refs.setReference(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const refProps = ctx.getReferenceProps(props) as AnchorHTMLAttributes<HTMLAnchorElement>;
  return <Comp ref={setRef} data-state={ctx.open ? 'open' : 'closed'} {...refProps} />;
});

export interface HoverCardPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: HoverCardPortalProps) {
  const ctx = useCtx('HoverCard.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

const Content = forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { forceMount, style, ...props },
  ref,
) {
  const ctx = useCtx('HoverCard.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;
  return (
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
  );
});

export const HoverCard = { Root: HoverCardRoot, Trigger, Portal, Content };
