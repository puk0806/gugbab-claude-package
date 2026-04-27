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

type Orientation = 'horizontal' | 'vertical';
type Activation = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: Orientation;
  activationMode: Activation;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(consumer: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Tabs.Root>`);
  return ctx;
}

export interface TabsRootProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  activationMode?: Activation;
}

const Root = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    ...rest
  },
  ref,
) {
  const [current, setValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const baseId = useId();

  return (
    <TabsContext.Provider
      value={{
        value: current,
        setValue: (v) => setValue(v),
        orientation,
        activationMode,
        baseId,
      }}
    >
      <div ref={ref} data-orientation={orientation} {...rest} />
    </TabsContext.Provider>
  );
});

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TabsList(props, ref) {
    const ctx = useTabsContext('Tabs.List');
    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={ctx.orientation}
        data-orientation={ctx.orientation}
        {...props}
      />
    );
  },
);

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  asChild?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value: itemValue, onClick, onKeyDown, type = 'button', disabled, asChild, ...rest },
  ref,
) {
  const ctx = useTabsContext('Tabs.Trigger');
  const dir = useDirection();
  const selected = ctx.value === itemValue;
  const triggerId = `${ctx.baseId}-trigger-${itemValue}`;
  const contentId = `${ctx.baseId}-content-${itemValue}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    const horizontal = ctx.orientation === 'horizontal';
    const rtl = dir === 'rtl';
    const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const prevKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';

    if (![nextKey, prevKey, 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();

    const list = (
      e.currentTarget.parentElement as HTMLElement | null
    )?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])');
    if (!list || list.length === 0) return;

    const currentIndex = Array.from(list).indexOf(e.currentTarget);
    let nextIndex = currentIndex;
    if (e.key === nextKey) nextIndex = (currentIndex + 1) % list.length;
    else if (e.key === prevKey) nextIndex = (currentIndex - 1 + list.length) % list.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = list.length - 1;

    const target = list[nextIndex];
    target?.focus();
    if (ctx.activationMode === 'automatic' && target) {
      ctx.setValue(target.dataset.value ?? '');
    }
  };

  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      role="tab"
      id={triggerId}
      aria-selected={selected}
      aria-controls={contentId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-state={selected ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      data-value={itemValue}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) ctx.setValue(itemValue);
      }}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

const Content = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value: itemValue, forceMount, ...rest },
  ref,
) {
  const ctx = useTabsContext('Tabs.Content');
  const selected = ctx.value === itemValue;
  if (!selected && !forceMount) return null;
  const triggerId = `${ctx.baseId}-trigger-${itemValue}`;
  const contentId = `${ctx.baseId}-content-${itemValue}`;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={contentId}
      aria-labelledby={triggerId}
      tabIndex={0}
      hidden={!selected}
      data-state={selected ? 'active' : 'inactive'}
      {...rest}
    />
  );
});

export const Tabs = { Root, List, Trigger, Content };
