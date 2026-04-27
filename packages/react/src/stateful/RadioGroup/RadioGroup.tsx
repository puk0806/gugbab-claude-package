import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useContext,
  useId,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { useDirection } from '../../shared/DirectionProvider';

interface RadioGroupContextValue {
  value: string;
  setValue: (v: string) => void;
  disabled: boolean;
  name: string;
  orientation: 'horizontal' | 'vertical';
}

const Ctx = createContext<RadioGroupContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <RadioGroup.Root>`);
  return ctx;
};

export interface RadioGroupRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
}

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(function RadioGroupRoot(
  {
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    required,
    name,
    orientation = 'vertical',
    ...rest
  },
  ref,
) {
  const [current, setValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <Ctx.Provider
      value={{
        value: current,
        setValue: (v) => setValue(v),
        disabled,
        name: groupName,
        orientation,
      }}
    >
      <div
        ref={ref}
        role="radiogroup"
        aria-required={required}
        aria-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      />
    </Ctx.Provider>
  );
});

export interface RadioGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  asChild?: boolean;
}

const Item = forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem(
  { value: itemValue, onClick, onKeyDown, type = 'button', disabled, asChild, ...rest },
  ref,
) {
  const ctx = useCtx('RadioGroup.Item');
  const dir = useDirection();
  const checked = ctx.value === itemValue;
  const finalDisabled = disabled ?? ctx.disabled;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    // WAI-ARIA: radios do not activate on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      return;
    }
    const horizontal = ctx.orientation === 'horizontal';
    const rtl = dir === 'rtl';
    const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const prevKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    if (![nextKey, prevKey].includes(e.key)) return;
    e.preventDefault();
    const items = (
      e.currentTarget.parentElement as HTMLElement | null
    )?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])');
    if (!items || items.length === 0) return;
    const currentIndex = Array.from(items).indexOf(e.currentTarget);
    const nextIndex =
      e.key === nextKey
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    const target = items[nextIndex];
    target?.focus();
    if (target) ctx.setValue(target.dataset.value ?? '');
  };

  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      role="radio"
      aria-checked={checked}
      tabIndex={checked || (!ctx.value && !rest['aria-describedby']) ? 0 : -1}
      disabled={finalDisabled}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={finalDisabled ? '' : undefined}
      data-value={itemValue}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !finalDisabled) ctx.setValue(itemValue);
      }}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});

const Indicator = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }
>(function RadioGroupIndicator({ forceMount, ...rest }, ref) {
  return <span ref={ref} {...rest} />;
});

export const RadioGroup = { Root, Item, Indicator };
