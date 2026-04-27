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
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFloatingBase } from '../../overlays/_floatingBase';
import { Slot } from '../../primitives/Slot/Slot';
import { usePresence } from '../../shared/usePresence';

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
}
const Ctx = createContext<SelectContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Select.Root>`);
  return ctx;
};

export interface SelectRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
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
      }}
    >
      <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
        {children}
      </FloatingList>
    </Ctx.Provider>
  );
}

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useCtx('Select.Trigger');
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
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      data-state={ctx.open ? 'open' : 'closed'}
      data-value={ctx.value || undefined}
      {...refProps}
    />
  );
});

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

function Portal({ children }: { children: ReactNode }) {
  return <FloatingPortal>{children}</FloatingPortal>;
}

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

const Content = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { forceMount, style, ...props },
  ref,
) {
  const ctx = useCtx('Select.Content');
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
        style={{ ...ctx.floatingStyles, ...style }}
        data-state={ctx.open ? 'open' : 'closed'}
        {...ctx.getFloatingProps(props)}
      />
    </FloatingFocusManager>
  );
});

const Viewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SelectViewport(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

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

const ItemText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SelectItemText(props, ref) {
    return <span ref={ref} {...props} />;
  },
);

const Group = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SelectGroup(props, ref) {
    return <div ref={ref} role="group" {...props} />;
  },
);

const GroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SelectGroupLabel(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

export const Select = {
  Root: SelectRoot,
  Trigger,
  Value,
  Portal,
  Content,
  Viewport,
  Item,
  ItemText,
  Group,
  GroupLabel,
};
