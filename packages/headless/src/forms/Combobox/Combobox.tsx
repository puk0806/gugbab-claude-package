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
} from '@floating-ui/react';
import { useControllableState, useMergedRefs } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFloatingBase } from '../../overlays/_floatingBase';

interface ComboboxContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  value: string;
  setValue: (v: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  context: ReturnType<typeof useFloatingBase>['context'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  listRef: React.RefObject<Array<HTMLElement | null>>;
  activeIndex: number | null;
}
const Ctx = createContext<ComboboxContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Combobox.Root>`);
  return ctx;
};

export interface ComboboxRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  children: ReactNode;
}

function ComboboxRoot({
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placement = 'bottom-start',
  children,
}: ComboboxRootProps) {
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
  const [text, setText] = useControllableState<string>({
    value: inputValue,
    defaultValue: defaultInputValue ?? '',
    onChange: onInputValueChange,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement,
  });

  const click = useClick(floating.context, { event: 'mousedown' });
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: 'combobox' });
  const listNav = useListNavigation(floating.context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
  ]);

  const { refs, context, floatingStyles } = floating;
  const ctxValue = useMemo<ComboboxContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      value: current,
      setValue,
      inputValue: text,
      setInputValue: setText,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      listRef,
      activeIndex,
    }),
    [
      isOpen,
      setOpen,
      current,
      setValue,
      text,
      setText,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
    ],
  );

  return (
    <Ctx.Provider value={ctxValue}>
      <FloatingList elementsRef={listRef}>{children}</FloatingList>
    </Ctx.Provider>
  );
}

const Anchor = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ComboboxAnchor(props, ref) {
    const ctx = useCtx('Combobox.Anchor');
    const composedRef = useMergedRefs<HTMLDivElement>(ctx.refs.setReference, ref);
    return <div ref={composedRef} {...props} />;
  },
);

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function ComboboxInput({ onChange, onFocus, onKeyDown, value, ...rest }, ref) {
    const ctx = useCtx('Combobox.Input');
    return (
      <input
        ref={ref}
        type="text"
        value={value ?? ctx.inputValue}
        aria-autocomplete="list"
        {...ctx.getReferenceProps({
          ...rest,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            ctx.setInputValue(e.target.value);
            if (!ctx.open) ctx.setOpen(true);
          },
          onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            onFocus?.(e);
            if (!ctx.open) ctx.setOpen(true);
          },
          onKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(e);
            if (e.defaultPrevented) return;
            // Virtual focus: the active option never receives DOM focus, so
            // Enter on the input commits it (reusing the item's click logic,
            // which already guards `disabled`).
            if (e.key !== 'Enter' || !ctx.open || ctx.activeIndex === null) return;
            // IME composition (e.g. Hangul): this Enter confirms the composed
            // text, not the option.
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            // The active option can vanish when the list is filtered — then
            // leave Enter alone so the surrounding form still submits.
            const active = ctx.listRef.current[ctx.activeIndex];
            if (!active) return;
            e.preventDefault();
            active.click();
          },
        })}
      />
    );
  },
);

const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ComboboxTrigger({ onClick, type = 'button', ...rest }, ref) {
    const ctx = useCtx('Combobox.Trigger');
    return (
      <button
        ref={ref}
        type={type}
        aria-haspopup="listbox"
        aria-expanded={ctx.open}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx.setOpen(!ctx.open);
        }}
        {...rest}
      />
    );
  },
);

function Portal({ children }: { children: ReactNode }) {
  return <FloatingPortal>{children}</FloatingPortal>;
}

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ComboboxContent(
  { style, ...props },
  ref,
) {
  const ctx = useCtx('Combobox.Content');
  const composedRef = useMergedRefs<HTMLDivElement>(ctx.refs.setFloating, ref);
  if (!ctx.open) return null;
  return (
    // modal={false}: focus stays in the input while typing (floating-ui's
    // combobox pattern); a modal manager adds unnamed focus guards.
    <FloatingFocusManager
      context={ctx.context}
      initialFocus={-1}
      modal={false}
      visuallyHiddenDismiss
    >
      <div
        ref={composedRef}
        style={{ ...ctx.floatingStyles, ...style }}
        data-state={ctx.open ? 'open' : 'closed'}
        {...ctx.getFloatingProps(props)}
      />
    </FloatingFocusManager>
  );
});

export interface ComboboxItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const Item = forwardRef<HTMLButtonElement, ComboboxItemProps>(function ComboboxItem(
  { value: itemValue, onClick, disabled, type = 'button', ...rest },
  ref,
) {
  const ctx = useCtx('Combobox.Item');
  const selected = ctx.value === itemValue;
  // FloatingList owns registration: index follows DOM order and unmounted
  // items are removed, so reopening/filtering never leaves stale nodes.
  const { ref: listItemRef, index } = useListItem();
  const composedRef = useMergedRefs<HTMLButtonElement>(listItemRef, ref);
  // `index` is null until FloatingList registers the item; without this guard
  // every item would match `activeIndex === null` on its first commit.
  const highlighted = index !== null && ctx.activeIndex === index;

  return (
    <button
      ref={composedRef}
      type={type}
      role="option"
      aria-selected={selected}
      data-highlighted={highlighted ? '' : undefined}
      disabled={disabled}
      {...ctx.getItemProps({
        ...rest,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (!e.defaultPrevented && !disabled) {
            ctx.setValue(itemValue);
            ctx.setOpen(false);
          }
        },
      })}
    />
  );
});

export const Combobox = {
  Root: ComboboxRoot,
  Anchor,
  Input,
  Trigger,
  Portal,
  Content,
  Item,
};
