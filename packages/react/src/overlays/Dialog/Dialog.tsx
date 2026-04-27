import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
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
import { usePresence } from '../../shared/usePresence';

interface DialogContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloating>['refs'];
  context: ReturnType<typeof useFloating>['context'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  contentId: string;
  titleId: string;
  descriptionId: string;
  role: 'dialog' | 'alertdialog';
  modal: boolean;
}

const DialogContext = createContext<DialogContextValue | null>(null);
function useDialogContext(consumer: string) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Dialog.Root>`);
  return ctx;
}

export interface DialogRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: 'dialog' | 'alertdialog';
  /** When true (default), interaction outside is blocked and scroll is locked. */
  modal?: boolean;
  children: React.ReactNode;
}

function DialogRoot({
  open,
  defaultOpen,
  onOpenChange,
  role = 'dialog',
  modal = true,
  children,
}: DialogRootProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: (next) => setOpen(next),
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
    // AlertDialog: never close on outside/escape
    escapeKey: role !== 'alertdialog',
    outsidePress: role !== 'alertdialog',
  });
  const roleHook = useRole(context, { role });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, roleHook]);
  const contentId = useId();
  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogContext.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs,
        context,
        getReferenceProps,
        getFloatingProps,
        contentId,
        titleId,
        descriptionId,
        role,
        modal,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useDialogContext('Dialog.Trigger');
  const Comp = asChild ? Slot : 'button';
  // biome-ignore lint/suspicious/noExplicitAny: floating-ui getReferenceProps narrows data-*/aria-*
  const combined = ctx.getReferenceProps(props as any) as Record<string, unknown>;
  const mergedRef = (node: HTMLButtonElement | null) => {
    ctx.refs.setReference(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const final = {
    ...combined,
    ref: mergedRef,
    type: asChild ? undefined : 'button',
    'aria-expanded': ctx.open,
    'aria-haspopup': ctx.role === 'alertdialog' ? 'dialog' : ctx.role,
    'aria-controls': ctx.contentId,
    'data-state': ctx.open ? 'open' : 'closed',
  };
  return <Comp {...(final as ButtonHTMLAttributes<HTMLButtonElement>)} />;
});

export interface DialogPortalProps {
  children?: React.ReactNode;
  /** Container element to portal content into. */
  container?: HTMLElement | null;
  /** Force mount when controlling animations externally. */
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: DialogPortalProps) {
  const ctx = useDialogContext('Dialog.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

const Overlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogOverlay(props, ref) {
    const ctx = useDialogContext('Dialog.Overlay');
    if (!ctx.open) return null;
    return (
      <FloatingOverlay
        ref={ref}
        lockScroll={ctx.modal}
        data-state={ctx.open ? 'open' : 'closed'}
        {...props}
      />
    );
  },
);

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  asChild?: boolean;
}

const Content = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { forceMount, asChild, ...props },
  ref,
) {
  const ctx = useDialogContext('Dialog.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <FloatingFocusManager context={ctx.context} modal={ctx.modal} returnFocus>
      <Comp
        ref={(node: HTMLDivElement | null) => {
          ctx.refs.setFloating(node);
          presenceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.descriptionId}
        data-state={ctx.open ? 'open' : 'closed'}
        {...ctx.getFloatingProps(props)}
      />
    </FloatingFocusManager>
  );
});

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}
const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { asChild, ...props },
  ref,
) {
  const ctx = useDialogContext('Dialog.Title');
  const Comp = asChild ? Slot : 'h2';
  return <Comp ref={ref} id={ctx.titleId} {...props} />;
});

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}
const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ asChild, ...props }, ref) {
    const ctx = useDialogContext('Dialog.Description');
    const Comp = asChild ? Slot : 'p';
    return <Comp ref={ref} id={ctx.descriptionId} {...props} />;
  },
);

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const Close = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { asChild, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = useDialogContext('Dialog.Close');
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

export const Dialog = {
  Root: DialogRoot,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
};
