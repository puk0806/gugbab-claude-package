import {
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
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

  // Dismissal handled by <DismissableLayer> on Content; floating-ui only
  // provides reference click + role wiring here.
  const click = useClick(context);
  const roleHook = useRole(context, { role });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, roleHook]);
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
  /** Cancellable. Called on `pointerdown` outside. AlertDialog default-prevents. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  /** Cancellable. Called when focus moves outside. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /** Cancellable. Called for any outside interaction (pointer or focus). */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  /** Cancellable. Called when Escape is pressed. AlertDialog default-prevents. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Cancellable. Called when Content auto-focuses on open. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Cancellable. Called when focus is restored on close. */
  onCloseAutoFocus?: (event: Event) => void;
}

/** Apply aria-hidden to all body children except the given node (and Portal containers). */
function hideOthers(contentNode: HTMLElement): () => void {
  const parent = contentNode.ownerDocument?.body ?? document.body;
  const hiddenNodes: Array<{ node: Element; prev: string | null }> = [];

  for (const child of Array.from(parent.children)) {
    // Skip the content node itself and any of its ancestors / containers
    if (child === contentNode || child.contains(contentNode)) continue;
    // Skip nodes already hidden
    if (child.getAttribute('aria-hidden') === 'true') continue;
    hiddenNodes.push({ node: child, prev: child.getAttribute('aria-hidden') });
    child.setAttribute('aria-hidden', 'true');
  }

  return () => {
    for (const { node, prev } of hiddenNodes) {
      if (prev === null) {
        node.removeAttribute('aria-hidden');
      } else {
        node.setAttribute('aria-hidden', prev);
      }
    }
  };
}

const Content = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  {
    forceMount,
    asChild,
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
  const ctx = useDialogContext('Dialog.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  const contentNodeRef = useRef<HTMLDivElement | null>(null);

  // dev-only: warn when Dialog.Title is absent
  useEffect(() => {
    if (!mounted) return;
    const node = contentNodeRef.current;
    if (!node) return;
    const titleEl = ctx.titleId ? node.ownerDocument?.getElementById(ctx.titleId) : null;
    if (!titleEl && process.env.NODE_ENV !== 'production') {
      console.error(
        '[gugbab-ui/Dialog] Missing accessible title. ' +
          'Add a <Dialog.Title> inside <Dialog.Content>, ' +
          'or use a visually hidden title: <Dialog.Title asChild><VisuallyHidden>…</VisuallyHidden></Dialog.Title>.',
      );
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: dev warning runs only on title binding change; including all deps would re-fire on every render
  }, [mounted, ctx.titleId]);

  // modal: hide siblings from assistive technology
  useEffect(() => {
    if (!ctx.modal || !mounted) return;
    const node = contentNodeRef.current;
    if (!node) return;
    return hideOthers(node);
  }, [ctx.modal, mounted]);

  if (!mounted && !forceMount) return null;
  const isAlert = ctx.role === 'alertdialog';
  const Comp = asChild ? Slot : 'div';

  const composeRef = (node: HTMLDivElement | null) => {
    contentNodeRef.current = node;
    ctx.refs.setFloating(node);
    presenceRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={ctx.modal}
      onPointerDownOutside={(event) => {
        // AlertDialog: outside click never closes.
        if (isAlert) event.preventDefault();
        onPointerDownOutside?.(event);
      }}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={(event) => {
        // AlertDialog: Escape never closes.
        if (isAlert) event.preventDefault();
        onEscapeKeyDown?.(event);
      }}
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
          role={ctx.role}
          aria-modal={ctx.modal || undefined}
          aria-labelledby={ctx.titleId}
          aria-describedby={ctx.descriptionId}
          data-state={ctx.open ? 'open' : 'closed'}
          {...ctx.getFloatingProps(props)}
        />
      </FocusScope>
    </DismissableLayer>
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
