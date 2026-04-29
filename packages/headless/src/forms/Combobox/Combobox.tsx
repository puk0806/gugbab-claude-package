import {
  FloatingFocusManager,
  FloatingPortal,
  type Placement,
  useClick,
  useDismiss,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useContext,
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

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        value: current,
        setValue: (v) => setValue(v),
        inputValue: text,
        setInputValue: (v) => setText(v),
        refs: floating.refs,
        context: floating.context,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        listRef,
        activeIndex,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

const Anchor = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ComboboxAnchor(props, ref) {
    const ctx = useCtx('Combobox.Anchor');
    return (
      <div
        ref={(node) => {
          ctx.refs.setReference(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...props}
      />
    );
  },
);

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function ComboboxInput({ onChange, onFocus, value, ...rest }, ref) {
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
  if (!ctx.open) return null;
  return (
    <FloatingFocusManager context={ctx.context} initialFocus={-1} visuallyHiddenDismiss>
      <div
        ref={(node) => {
          ctx.refs.setFloating(node);
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

export interface ComboboxItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const Item = forwardRef<HTMLButtonElement, ComboboxItemProps>(function ComboboxItem(
  { value: itemValue, onClick, disabled, type = 'button', ...rest },
  ref,
) {
  const ctx = useCtx('Combobox.Item');
  const selected = ctx.value === itemValue;

  return (
    <button
      ref={(node) => {
        if (node) {
          const idx = ctx.listRef.current.indexOf(node);
          if (idx === -1) ctx.listRef.current.push(node);
        }
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      type={type}
      role="option"
      aria-selected={selected}
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
