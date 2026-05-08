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
import { usePresence } from '../../shared/usePresence';

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

interface CollapsibleContextValue {
  open: boolean;
  disabled: boolean;
  contentId: string;
  triggerId: string;
  setOpen: (v: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(consumer: string) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Collapsible.Root>`);
  return ctx;
}

export interface CollapsibleRootProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>(function CollapsibleRoot(
  { open, defaultOpen, disabled = false, onOpenChange, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const contentId = useId();
  const triggerId = useId();

  return (
    <CollapsibleContext.Provider
      value={{
        open: isOpen,
        disabled,
        contentId,
        triggerId,
        setOpen: (v) => setOpen(v),
      }}
    >
      <div
        ref={ref}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      />
    </CollapsibleContext.Provider>
  );
});

const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(function CollapsibleTrigger(
  { onClick, type = 'button', disabled, asChild, ...rest },
  ref,
) {
  const ctx = useCollapsibleContext('Collapsible.Trigger');
  const finalDisabled = disabled ?? ctx.disabled;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      id={ctx.triggerId}
      aria-controls={ctx.contentId}
      aria-expanded={ctx.open}
      data-state={ctx.open ? 'open' : 'closed'}
      data-disabled={finalDisabled ? '' : undefined}
      disabled={finalDisabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !finalDisabled) ctx.setOpen(!ctx.open);
      }}
      {...rest}
    />
  );
});

const Content = forwardRef<HTMLDivElement, CollapsibleContentProps>(function CollapsibleContent(
  { forceMount, style, ...props },
  ref,
) {
  const ctx = useCollapsibleContext('Collapsible.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  const sizeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sizeRef.current;
    if (!node) return;

    const updateSize = () => {
      node.style.setProperty('--gugbab-collapsible-content-height', `${node.scrollHeight}px`);
      node.style.setProperty('--gugbab-collapsible-content-width', `${node.scrollWidth}px`);
    };
    updateSize();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!mounted && !forceMount) return null;
  return (
    <div
      ref={(node) => {
        sizeRef.current = node;
        presenceRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      id={ctx.contentId}
      role="region"
      aria-labelledby={ctx.triggerId}
      data-state={ctx.open ? 'open' : 'closed'}
      hidden={!ctx.open}
      style={style}
      {...props}
    />
  );
});

export const Collapsible = { Root, Trigger, Content };
