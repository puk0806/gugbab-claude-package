import { useControllableState, useMergedRefs } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  useContext,
  useId,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { useDirection } from '../../shared/DirectionProvider';
import { RovingFocusGroup, useRovingFocusGroupItem } from '../../shared/RovingFocusGroup';

type Orientation = 'horizontal' | 'vertical';
type Activation = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: Orientation;
  activationMode: Activation;
  baseId: string;
  loop: boolean;
  dir?: 'ltr' | 'rtl';
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
  loop?: boolean;
  dir?: 'ltr' | 'rtl';
}

const Root = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    loop = false,
    dir,
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
  const resolvedDir = useDirection(dir);

  return (
    <TabsContext.Provider
      value={{
        value: current,
        setValue: (v) => setValue(v),
        orientation,
        activationMode,
        baseId,
        loop,
        dir: resolvedDir,
      }}
    >
      <div ref={ref} data-orientation={orientation} dir={resolvedDir} {...rest} />
    </TabsContext.Provider>
  );
});

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TabsList(
  { children, ...props },
  ref,
) {
  const ctx = useTabsContext('Tabs.List');
  return (
    <RovingFocusGroup asChild orientation={ctx.orientation} dir={ctx.dir} loop={ctx.loop}>
      <div
        ref={ref}
        role="tablist"
        aria-orientation={ctx.orientation}
        data-orientation={ctx.orientation}
        {...props}
      >
        {children}
      </div>
    </RovingFocusGroup>
  );
});

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  asChild?: boolean;
}

/** Compute which sibling trigger value to activate given a keypress. */
function getNextValue(
  e: KeyboardEvent<HTMLButtonElement>,
  orientation: Orientation,
  dir: 'ltr' | 'rtl' | undefined,
  loop: boolean,
): string | null {
  const horizontal = orientation === 'horizontal';
  const rtl = dir === 'rtl';

  const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
  const prevKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
  const isNav = [nextKey, prevKey, 'Home', 'End'].includes(e.key);
  if (!isNav) return null;

  const list = (
    e.currentTarget.parentElement as HTMLElement | null
  )?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])');
  if (!list || list.length === 0) return null;

  const items = Array.from(list);
  const currentIndex = items.indexOf(e.currentTarget);
  let nextIndex = currentIndex;

  if (e.key === nextKey) {
    nextIndex = loop
      ? (currentIndex + 1) % items.length
      : Math.min(currentIndex + 1, items.length - 1);
  } else if (e.key === prevKey) {
    nextIndex = loop
      ? (currentIndex - 1 + items.length) % items.length
      : Math.max(currentIndex - 1, 0);
  } else if (e.key === 'Home') {
    nextIndex = 0;
  } else if (e.key === 'End') {
    nextIndex = items.length - 1;
  }

  return items[nextIndex]?.dataset.value ?? null;
}

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  {
    value: itemValue,
    onClick,
    onFocus,
    onKeyDown,
    onMouseDown,
    type = 'button',
    disabled,
    asChild,
    ...rest
  },
  ref,
) {
  const ctx = useTabsContext('Tabs.Trigger');
  const selected = ctx.value === itemValue;
  const triggerId = `${ctx.baseId}-trigger-${itemValue}`;
  const contentId = `${ctx.baseId}-content-${itemValue}`;

  const rovingProps = useRovingFocusGroupItem({
    active: selected,
    focusable: !disabled,
  });

  const composedRef = useMergedRefs<HTMLButtonElement>(
    ref,
    rovingProps.ref as Ref<HTMLButtonElement>,
  );

  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={composedRef}
      type={asChild ? undefined : type}
      role="tab"
      id={triggerId}
      aria-selected={selected}
      aria-controls={contentId}
      tabIndex={rovingProps.tabIndex}
      disabled={disabled}
      data-state={selected ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      data-value={itemValue}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) ctx.setValue(itemValue);
      }}
      onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        rovingProps.onFocus(e);
      }}
      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
        onMouseDown?.(e);
        rovingProps.onMouseDown(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        // automatic mode: activate the target tab synchronously on nav key
        // Must run before rovingProps.onKeyDown because it calls preventDefault()
        if (ctx.activationMode === 'automatic' && !disabled) {
          const nextVal = getNextValue(e, ctx.orientation, ctx.dir, ctx.loop);
          if (nextVal !== null) ctx.setValue(nextVal);
        }
        rovingProps.onKeyDown(e);
      }}
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
