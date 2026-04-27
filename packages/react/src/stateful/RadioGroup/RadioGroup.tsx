import { useControllableState, useMergedRefs } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  useContext,
  useId,
  useRef,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { BubbleInput } from '../../shared/BubbleInput';
import { useDirection } from '../../shared/DirectionProvider';
import { RovingFocusGroup, useRovingFocusGroupItem } from '../../shared/RovingFocusGroup';

interface RadioGroupContextValue {
  value: string;
  setValue: (v: string) => void;
  disabled: boolean;
  name: string;
  /** true when a name was explicitly provided — BubbleInput is only rendered then */
  hasName: boolean;
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
    children,
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
  const dir = useDirection();

  return (
    <Ctx.Provider
      value={{
        value: current,
        setValue: (v) => setValue(v),
        disabled,
        name: groupName,
        hasName: name !== undefined,
        orientation,
      }}
    >
      <RovingFocusGroup asChild orientation={orientation} dir={dir} loop>
        <div
          ref={ref}
          role="radiogroup"
          aria-required={required}
          aria-orientation={orientation}
          data-disabled={disabled ? '' : undefined}
          {...rest}
        >
          {children}
        </div>
      </RovingFocusGroup>
    </Ctx.Provider>
  );
});

export interface RadioGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  asChild?: boolean;
}

const Item = forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem(
  {
    value: itemValue,
    onClick,
    onKeyDown,
    onFocus,
    onMouseDown,
    type = 'button',
    disabled,
    asChild,
    style,
    ...rest
  },
  forwardedRef,
) {
  const ctx = useCtx('RadioGroup.Item');
  const checked = ctx.value === itemValue;
  const finalDisabled = disabled ?? ctx.disabled;
  const buttonRef = useRef<HTMLElement | null>(null);

  const rovingProps = useRovingFocusGroupItem({
    active: checked,
    focusable: !finalDisabled,
  });

  const composedRef = useMergedRefs<HTMLElement>(
    forwardedRef as Ref<HTMLElement>,
    rovingProps.ref,
    buttonRef,
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    // WAI-ARIA: radios do not activate on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      return;
    }

    // Determine if this key is a navigation key for RovingFocusGroup.
    // We compute the target item synchronously so setValue fires before focus
    // moves (jsdom tests rely on synchronous selection change).
    const horizontal = ctx.orientation === 'horizontal';
    const rtl =
      ctx.orientation === 'horizontal'
        ? (rovingProps.ref as React.RefObject<HTMLElement>).current
            ?.closest('[data-roving-group]')
            ?.getAttribute('data-dir') === 'rtl'
        : false;

    const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const prevKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const isHome = e.key === 'Home';
    const isEnd = e.key === 'End';
    const isNext = e.key === nextKey;
    const isPrev = e.key === prevKey;

    if (isNext || isPrev || isHome || isEnd) {
      e.preventDefault();
      // Collect all enabled radio items within the group
      const group = (e.currentTarget as HTMLElement).closest('[role="radiogroup"]');
      if (!group) return;
      const items = Array.from(
        group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'),
      );
      if (items.length === 0) return;
      const currentIndex = items.indexOf(e.currentTarget as HTMLButtonElement);

      let targetIndex: number;
      if (isHome) {
        targetIndex = 0;
      } else if (isEnd) {
        targetIndex = items.length - 1;
      } else if (isNext) {
        targetIndex = (currentIndex + 1) % items.length;
      } else {
        // isPrev
        targetIndex = (currentIndex - 1 + items.length) % items.length;
      }

      const target = items[targetIndex];
      if (target) {
        // Select synchronously so tests (which check aria-checked right after
        // keyDown) pass — RovingFocusGroup will handle actual DOM focus.
        const targetValue = target.dataset.value ?? '';
        ctx.setValue(targetValue);
        // Also delegate to RovingFocusGroup for tabIndex management + DOM focus.
        rovingProps.onKeyDown(e as unknown as KeyboardEvent<HTMLElement>);
      }
      return;
    }

    // Non-navigation keys: still pass to roving (e.g. nothing to do, but be safe)
    rovingProps.onKeyDown(e as unknown as KeyboardEvent<HTMLElement>);
  };

  const { children: restChildren, ...restWithoutChildren } = rest as typeof rest & {
    children?: React.ReactNode;
  };

  const commonProps = {
    ref: composedRef as Ref<HTMLButtonElement>,
    role: 'radio' as const,
    'aria-checked': checked,
    tabIndex: rovingProps.tabIndex,
    disabled: finalDisabled,
    'data-state': checked ? 'checked' : 'unchecked',
    'data-disabled': finalDisabled ? '' : undefined,
    'data-value': itemValue,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && !finalDisabled) ctx.setValue(itemValue);
    },
    onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
      onFocus?.(e);
      if (!e.defaultPrevented) {
        rovingProps.onFocus(e as unknown as React.FocusEvent<HTMLElement>);
      }
    },
    onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseDown?.(e);
      if (!e.defaultPrevented)
        rovingProps.onMouseDown(e as unknown as React.MouseEvent<HTMLElement>);
    },
    onKeyDown: handleKeyDown,
    style: { position: 'relative' as const, ...style },
    ...restWithoutChildren,
  };

  if (asChild) {
    return <Slot {...commonProps}>{restChildren}</Slot>;
  }

  return (
    <button type={type} {...commonProps}>
      {restChildren}
      {ctx.hasName ? (
        <BubbleInput
          control={buttonRef.current}
          bubbles
          type="radio"
          name={ctx.name}
          value={itemValue}
          checked={checked}
          disabled={finalDisabled}
        />
      ) : null}
    </button>
  );
});

const Indicator = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }
>(function RadioGroupIndicator({ forceMount, ...rest }, ref) {
  return <span ref={ref} {...rest} />;
});

export const RadioGroup = { Root, Item, Indicator };
