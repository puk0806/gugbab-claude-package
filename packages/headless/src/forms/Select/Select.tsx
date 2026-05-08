import {
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  type Placement,
  useClick,
  useDismiss,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
  useTypeahead,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useFloatingBase } from '../../overlays/_floatingBase';
import { Slot } from '../../primitives/Slot/Slot';
import { usePresence } from '../../shared/usePresence';

// ─── Context ───────────────────────────────────────────────────────────────

interface SelectContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  value: string;
  setValue: (v: string) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  context: ReturnType<typeof useFloatingBase>['context'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  elementsRef: React.RefObject<Array<HTMLElement | null>>;
  labelsRef: React.RefObject<Array<string | null>>;
  activeIndex: number | null;
  registerLabel: (value: string, label: string) => void;
  unregisterLabel: (value: string) => void;
  selectedLabel: string;
  /** Form submission */
  name?: string;
  form?: string;
  /** position mode for Content */
  position: 'item-aligned' | 'popper';
  /** ref to the content scroll container for ScrollButtons */
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const Ctx = createContext<SelectContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Select.Root>`);
  return ctx;
};

// ─── Group Context (for Label aria-labelledby) ─────────────────────────────

interface GroupContextValue {
  labelId: string;
}
const GroupCtx = createContext<GroupContextValue | null>(null);

// ─── Root ──────────────────────────────────────────────────────────────────

export interface SelectRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  /** Native form field name — renders a hidden input for form submission */
  name?: string;
  /** Associate with a specific form by id */
  form?: string;
  children: ReactNode;
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placement,
  name,
  form,
  children,
}: SelectRootProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [current, setValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const [valueLabelMap, setValueLabelMap] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);

  const registerLabel = useCallback((itemValue: string, label: string) => {
    setValueLabelMap((prev) =>
      prev[itemValue] === label ? prev : { ...prev, [itemValue]: label },
    );
  }, []);
  const unregisterLabel = useCallback((itemValue: string) => {
    setValueLabelMap((prev) => {
      if (!(itemValue in prev)) return prev;
      const next = { ...prev };
      delete next[itemValue];
      return next;
    });
  }, []);

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement,
  });

  const click = useClick(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: 'listbox' });
  const listNav = useListNavigation(floating.context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const typeahead = useTypeahead(floating.context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: (index) => {
      setActiveIndex(index);
    },
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
    typeahead,
  ]);

  const selectedLabel = valueLabelMap[current] ?? '';

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        value: current,
        setValue: (v) => setValue(v),
        refs: floating.refs,
        context: floating.context,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        elementsRef,
        labelsRef,
        activeIndex,
        registerLabel,
        unregisterLabel,
        selectedLabel,
        name,
        form,
        position: 'popper',
        contentRef,
      }}
    >
      <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
        {children}
      </FloatingList>
    </Ctx.Provider>
  );
}

// ─── Trigger ───────────────────────────────────────────────────────────────

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useCtx('Select.Trigger');
  const Comp = asChild ? Slot : 'button';
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    ctx.refs.setReference(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const refProps = ctx.getReferenceProps(props) as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <>
      <Comp
        ref={setRef}
        type={asChild ? undefined : 'button'}
        aria-haspopup="listbox"
        aria-expanded={ctx.open}
        data-state={ctx.open ? 'open' : 'closed'}
        data-value={ctx.value || undefined}
        {...refProps}
      />
      {/* Hidden input for form submission */}
      {ctx.name != null && (
        <input
          type="hidden"
          aria-hidden
          tabIndex={-1}
          name={ctx.name}
          form={ctx.form}
          value={ctx.value}
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, margin: 0 }}
        />
      )}
    </>
  );
});

// ─── Value ─────────────────────────────────────────────────────────────────

const Value = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(function SelectValue({ placeholder, children, ...rest }, ref) {
  const ctx = useCtx('Select.Value');
  return (
    <span ref={ref} {...rest}>
      {children ?? (ctx.selectedLabel || placeholder)}
    </span>
  );
});

// ─── Portal ────────────────────────────────────────────────────────────────

function Portal({ children }: { children: ReactNode }) {
  return <FloatingPortal>{children}</FloatingPortal>;
}

// ─── Content ───────────────────────────────────────────────────────────────

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  /**
   * `'popper'` (default) — positioned via floating-ui.
   * `'item-aligned'` — selected item aligns with trigger (Radix-style).
   */
  position?: 'item-aligned' | 'popper';
}

const Content = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { forceMount, style, position = 'popper', ...props },
  ref,
) {
  const ctx = useCtx('Select.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;

  // item-aligned: override positioning so the floating element sits directly
  // over the trigger (no offset). We keep width:max-content so it can grow.
  const positionStyle =
    position === 'item-aligned'
      ? ({
          ...ctx.floatingStyles,
          top: ctx.floatingStyles.top,
          // Remove vertical offset — align top of content with top of trigger
          transform: 'none',
          ...style,
        } as React.CSSProperties)
      : { ...ctx.floatingStyles, ...style };

  return (
    <FloatingFocusManager context={ctx.context} modal={false}>
      <div
        ref={(node) => {
          ctx.refs.setFloating(node);
          ctx.contentRef.current = node;
          presenceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        style={positionStyle}
        data-state={ctx.open ? 'open' : 'closed'}
        data-position={position}
        {...ctx.getFloatingProps(props)}
      />
    </FloatingFocusManager>
  );
});

// ─── Viewport ──────────────────────────────────────────────────────────────

const Viewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SelectViewport(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

// ─── ScrollUpButton ────────────────────────────────────────────────────────

const SCROLL_SPEED = 8; // px per interval tick
const SCROLL_INTERVAL = 16; // ~60 fps

export type SelectScrollButtonProps = HTMLAttributes<HTMLDivElement>;

const ScrollUpButton = forwardRef<HTMLDivElement, SelectScrollButtonProps>(
  function SelectScrollUpButton({ onPointerEnter, onPointerLeave, ...props }, ref) {
    const ctx = useCtx('Select.ScrollUpButton');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopScroll = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startScroll = () => {
      stopScroll();
      intervalRef.current = setInterval(() => {
        const el = ctx.contentRef.current;
        if (el) el.scrollTop -= SCROLL_SPEED;
      }, SCROLL_INTERVAL);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: stopScroll is recreated every render; deps intentionally empty to register cleanup only on mount
    useEffect(() => stopScroll, []);

    return (
      <div
        ref={ref}
        aria-hidden
        data-scroll-button="up"
        onPointerEnter={(e) => {
          startScroll();
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          stopScroll();
          onPointerLeave?.(e);
        }}
        {...props}
      />
    );
  },
);

// ─── ScrollDownButton ──────────────────────────────────────────────────────

const ScrollDownButton = forwardRef<HTMLDivElement, SelectScrollButtonProps>(
  function SelectScrollDownButton({ onPointerEnter, onPointerLeave, ...props }, ref) {
    const ctx = useCtx('Select.ScrollDownButton');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopScroll = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startScroll = () => {
      stopScroll();
      intervalRef.current = setInterval(() => {
        const el = ctx.contentRef.current;
        if (el) el.scrollTop += SCROLL_SPEED;
      }, SCROLL_INTERVAL);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: stopScroll is recreated every render; deps intentionally empty to register cleanup only on mount
    useEffect(() => stopScroll, []);

    return (
      <div
        ref={ref}
        aria-hidden
        data-scroll-button="down"
        onPointerEnter={(e) => {
          startScroll();
          onPointerLeave?.(e);
        }}
        onPointerLeave={(e) => {
          stopScroll();
          onPointerLeave?.(e);
        }}
        {...props}
      />
    );
  },
);

// ─── Item ──────────────────────────────────────────────────────────────────

export interface SelectItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  /** Accessible label used for typeahead. Defaults to button text content. */
  label?: string;
  asChild?: boolean;
}

const Item = forwardRef<HTMLButtonElement, SelectItemProps>(function SelectItem(
  { value: itemValue, label, onClick, children, disabled, type = 'button', asChild, ...rest },
  ref,
) {
  const ctx = useCtx('Select.Item');
  const selected = ctx.value === itemValue;
  const itemLabel = label ?? (typeof children === 'string' ? children : itemValue);
  const { ref: listItemRef } = useListItem({ label: itemLabel });
  const { registerLabel, unregisterLabel } = ctx;

  useEffect(() => {
    registerLabel(itemValue, itemLabel);
    return () => unregisterLabel(itemValue);
  }, [registerLabel, unregisterLabel, itemValue, itemLabel]);

  const Comp = asChild ? Slot : 'button';
  const setRef = (node: HTMLButtonElement | null) => {
    listItemRef(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <Comp
      ref={setRef}
      type={asChild ? undefined : type}
      role="option"
      aria-selected={selected}
      data-state={selected ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      {...(ctx.getItemProps({
        ...rest,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (!e.defaultPrevented && !disabled) {
            ctx.setValue(itemValue);
            ctx.setOpen(false);
          }
        },
      }) as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </Comp>
  );
});

// ─── ItemText ──────────────────────────────────────────────────────────────

const ItemText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SelectItemText(props, ref) {
    return <span ref={ref} {...props} />;
  },
);

// ─── Group ─────────────────────────────────────────────────────────────────

const Group = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SelectGroup(
  { children, ...props },
  ref,
) {
  const labelId = useId();
  return (
    <GroupCtx.Provider value={{ labelId }}>
      <div ref={ref} role="group" aria-labelledby={labelId} {...props}>
        {children}
      </div>
    </GroupCtx.Provider>
  );
});

// ─── Label (GroupLabel) ────────────────────────────────────────────────────

const GroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SelectGroupLabel(props, ref) {
    const groupCtx = useContext(GroupCtx);
    return <div ref={ref} id={groupCtx?.labelId} role="presentation" {...props} />;
  },
);

// Alias for Radix-parity: Select.Label === Select.GroupLabel
const Label = GroupLabel;

// ─── Export ────────────────────────────────────────────────────────────────

export const Select = {
  Root: SelectRoot,
  Trigger,
  Value,
  Portal,
  Content,
  Viewport,
  ScrollUpButton,
  ScrollDownButton,
  Item,
  ItemText,
  Group,
  GroupLabel,
  Label,
};
