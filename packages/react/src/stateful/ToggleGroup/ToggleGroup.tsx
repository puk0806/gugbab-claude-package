import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useContext,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { type Direction, useDirection } from '../../shared/DirectionProvider';

interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  value: string[];
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
  toggle: (v: string) => void;
  hasAnyPressed: boolean;
  rovingFocus: boolean;
}

const Ctx = createContext<ToggleGroupContextValue | null>(null);

function useCtx(consumer: string) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${consumer} must be used inside <ToggleGroup.Root>`);
  return ctx;
}

const ITEM_SELECTOR = '[data-toggle-group-item]:not([disabled])';

interface CommonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  dir?: Direction;
  loop?: boolean;
  /**
   * When false, the group does NOT manage its own keyboard navigation —
   * useful when nested inside a parent that owns roving focus (e.g. Toolbar).
   * @default true
   */
  rovingFocus?: boolean;
}
interface SingleProps extends CommonProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
}
interface MultipleProps extends CommonProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (v: string[]) => void;
}
export type ToggleGroupRootProps = SingleProps | MultipleProps;

const Root = forwardRef<HTMLDivElement, ToggleGroupRootProps>(function ToggleGroupRoot(props, ref) {
  if (props.type === 'single') {
    const {
      type: _t,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      orientation = 'horizontal',
      dir,
      loop = true,
      rovingFocus = true,
      ...rest
    } = props;
    return (
      <SingleInner
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        orientation={orientation}
        dir={dir}
        loop={loop}
        rovingFocus={rovingFocus}
        rest={rest}
      />
    );
  }
  const {
    type: _t,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    orientation = 'horizontal',
    dir,
    loop = true,
    rovingFocus = true,
    ...rest
  } = props;
  return (
    <MultipleInner
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      orientation={orientation}
      dir={dir}
      loop={loop}
      rovingFocus={rovingFocus}
      rest={rest}
    />
  );
});

interface InnerCommon {
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
  dir?: Direction;
  loop: boolean;
  rovingFocus: boolean;
  rest: HTMLAttributes<HTMLDivElement>;
}

interface InnerSingleProps extends InnerCommon {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
}
const SingleInner = forwardRef<HTMLDivElement, InnerSingleProps>(function SingleInner(
  { value, defaultValue, onValueChange, disabled, orientation, dir, loop, rovingFocus, rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const values = current ? [current] : [];
  const toggle = (v: string) => setCurrent(current === v ? '' : v);

  return (
    <Ctx.Provider
      value={{
        type: 'single',
        value: values,
        disabled,
        orientation,
        toggle,
        hasAnyPressed: values.length > 0,
        rovingFocus,
      }}
    >
      <Container
        ref={ref}
        orientation={orientation}
        dir={dir}
        loop={loop}
        rovingFocus={rovingFocus}
        role="radiogroup"
        rest={rest}
      />
    </Ctx.Provider>
  );
});

interface InnerMultipleProps extends InnerCommon {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (v: string[]) => void;
}
const MultipleInner = forwardRef<HTMLDivElement, InnerMultipleProps>(function MultipleInner(
  { value, defaultValue, onValueChange, disabled, orientation, dir, loop, rovingFocus, rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const toggle = (v: string) =>
    setCurrent((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <Ctx.Provider
      value={{
        type: 'multiple',
        value: current,
        disabled,
        orientation,
        toggle,
        hasAnyPressed: current.length > 0,
        rovingFocus,
      }}
    >
      <Container
        ref={ref}
        orientation={orientation}
        dir={dir}
        loop={loop}
        rovingFocus={rovingFocus}
        role="group"
        rest={rest}
      />
    </Ctx.Provider>
  );
});

interface ContainerProps {
  orientation: 'horizontal' | 'vertical';
  dir?: Direction;
  loop: boolean;
  rovingFocus: boolean;
  role: 'radiogroup' | 'group';
  rest: HTMLAttributes<HTMLDivElement>;
}
const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { orientation, dir, loop, rovingFocus, role, rest },
  ref,
) {
  const direction = useDirection(dir);
  const isLtr = direction === 'ltr';
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (!rovingFocus) return;
    const horizontal = orientation === 'horizontal';
    const nextKey = horizontal ? (isLtr ? 'ArrowRight' : 'ArrowLeft') : 'ArrowDown';
    const prevKey = horizontal ? (isLtr ? 'ArrowLeft' : 'ArrowRight') : 'ArrowUp';
    if (![nextKey, prevKey, 'Home', 'End'].includes(e.key)) return;
    const root = e.currentTarget;
    const items = Array.from(root.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR));
    const idx = items.indexOf(e.target as HTMLButtonElement);
    if (idx === -1) return;
    e.preventDefault();
    const last = items.length - 1;
    let next = idx;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key === nextKey) next = idx === last ? (loop ? 0 : last) : idx + 1;
    else if (e.key === prevKey) next = idx === 0 ? (loop ? last : 0) : idx - 1;
    items[next]?.focus();
  };

  return (
    <div ref={ref} role={role} data-orientation={orientation} {...rest} onKeyDown={onKeyDown} />
  );
});

export interface ToggleGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  asChild?: boolean;
}

const Item = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value: itemValue, onClick, type = 'button', disabled, asChild, ...rest },
  ref,
) {
  const ctx = useCtx('ToggleGroup.Item');
  const pressed = ctx.value.includes(itemValue);
  const finalDisabled = disabled ?? ctx.disabled;
  const Comp = asChild ? Slot : 'button';
  // roving tabindex applies only when the group manages its own keyboard nav;
  // when nested inside a parent that handles focus (e.g. Toolbar), defer.
  const tabIndex = ctx.rovingFocus ? (pressed || !ctx.hasAnyPressed ? 0 : -1) : undefined;

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      aria-pressed={ctx.type === 'multiple' ? pressed : undefined}
      role={ctx.type === 'single' ? 'radio' : undefined}
      aria-checked={ctx.type === 'single' ? pressed : undefined}
      disabled={finalDisabled}
      data-state={pressed ? 'on' : 'off'}
      data-disabled={finalDisabled ? '' : undefined}
      data-toggle-group-item=""
      data-orientation={ctx.orientation}
      tabIndex={tabIndex}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !finalDisabled) ctx.toggle(itemValue);
      }}
      {...rest}
    />
  );
});

export const ToggleGroup = { Root, Item };
