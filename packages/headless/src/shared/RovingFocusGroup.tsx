import { useMergedRefs } from '@gugbab/hooks';
import {
  createContext,
  type FocusEventHandler,
  forwardRef,
  type HTMLAttributes,
  type MouseEventHandler,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Slot } from '../primitives/Slot';
import { useDirection } from './DirectionProvider';

export type RovingFocusOrientation = 'horizontal' | 'vertical';
export type RovingFocusDirection = 'ltr' | 'rtl';

export interface RovingFocusGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'dir'> {
  asChild?: boolean;
  /** Determines which arrow keys navigate. Default: 'horizontal'. */
  orientation?: RovingFocusOrientation;
  /** Reading direction. Reverses ArrowLeft/ArrowRight when 'rtl'. */
  dir?: RovingFocusDirection;
  /** When true, navigating past the last/first item wraps. Default: false. */
  loop?: boolean;
  children?: ReactNode;
}

interface RovingItem {
  id: string;
  ref: { current: HTMLElement | null };
  focusable: boolean;
  active: boolean;
}

interface RovingFocusContextValue {
  orientation: RovingFocusOrientation;
  dir: RovingFocusDirection;
  loop: boolean;
  /** id of the item that should currently render with tabIndex=0. */
  effectiveTabStopId: string | null;
  /** Called when the user explicitly focuses or clicks an item. */
  setCurrentTabStopId: (id: string) => void;
  registerItem: (item: RovingItem) => () => void;
  /** Returns items in DOM order, filtered to focusable ones. */
  getFocusableItems: () => RovingItem[];
}

const RovingFocusContext = createContext<RovingFocusContextValue | null>(null);

export const RovingFocusGroup = forwardRef<HTMLDivElement, RovingFocusGroupProps>(
  function RovingFocusGroup(props, forwardedRef) {
    const { asChild, orientation = 'horizontal', dir, loop = false, children, ...rest } = props;

    const resolvedDir = useDirection(dir);
    const itemsRef = useRef<Map<string, RovingItem>>(new Map());
    // Tick to trigger re-render when items change.
    const [tick, setTick] = useState(0);
    // User-driven tab stop. null = "let the group auto-pick".
    const [currentTabStopId, setCurrentTabStopId] = useState<string | null>(null);

    const registerItem = useCallback((item: RovingItem) => {
      itemsRef.current.set(item.id, item);
      setTick((t) => t + 1);
      return () => {
        itemsRef.current.delete(item.id);
        setTick((t) => t + 1);
        setCurrentTabStopId((curr) => (curr === item.id ? null : curr));
      };
    }, []);

    const getFocusableItems = useCallback(() => {
      const all = Array.from(itemsRef.current.values()).filter((i) => i.focusable);
      return all.sort((a, b) => {
        const aNode = a.ref.current;
        const bNode = b.ref.current;
        if (!aNode || !bNode) return 0;
        const pos = aNode.compareDocumentPosition(bNode);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
    }, []);

    // Derived each render — recomputed because `tick` is in deps, so any
    // register/unregister bumps it.
    // biome-ignore lint/correctness/useExhaustiveDependencies: tick triggers recompute
    const effectiveTabStopId = useMemo<string | null>(() => {
      const items = getFocusableItems();
      if (currentTabStopId && items.some((i) => i.id === currentTabStopId)) {
        return currentTabStopId;
      }
      const active = items.find((i) => i.active);
      if (active) return active.id;
      return items[0]?.id ?? null;
    }, [currentTabStopId, getFocusableItems, tick]);

    const contextValue = useMemo<RovingFocusContextValue>(
      () => ({
        orientation,
        dir: resolvedDir,
        loop,
        effectiveTabStopId,
        setCurrentTabStopId,
        registerItem,
        getFocusableItems,
      }),
      [orientation, resolvedDir, loop, effectiveTabStopId, registerItem, getFocusableItems],
    );

    const Comp: React.ElementType = asChild ? Slot : 'div';

    return (
      <RovingFocusContext.Provider value={contextValue}>
        <Comp
          tabIndex={0}
          data-orientation={orientation}
          data-roving-group="true"
          {...rest}
          ref={forwardedRef}
        >
          {children}
        </Comp>
      </RovingFocusContext.Provider>
    );
  },
);

RovingFocusGroup.displayName = 'RovingFocusGroup';

/* -------------------------------------------------------------------------- */
/* Item                                                                        */
/* -------------------------------------------------------------------------- */

export interface UseRovingFocusGroupItemOptions {
  /** Pre-mark this item as the active tab stop on mount. */
  active?: boolean;
  /** When false, the item is skipped during keyboard navigation. */
  focusable?: boolean;
  /** Optional stable id; auto-generated if not provided. */
  id?: string;
}

export interface RovingFocusGroupItemProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  active?: boolean;
  focusable?: boolean;
  id?: string;
  children?: ReactNode;
}

export function useRovingFocusGroupItem(options: UseRovingFocusGroupItemOptions = {}) {
  const { active = false, focusable = true, id: idProp } = options;
  const ctx = useContext(RovingFocusContext);
  if (!ctx) {
    throw new Error('useRovingFocusGroupItem must be used inside <RovingFocusGroup>');
  }
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const ref = useRef<HTMLElement | null>(null);

  // Mutable item slot — kept in sync with prop changes via useEffect below.
  const itemSlot = useRef<RovingItem>({ id, ref, focusable, active });
  itemSlot.current.focusable = focusable;
  itemSlot.current.active = active;

  // Register on mount, unregister on unmount only. We pass the *same* item
  // object reference to the registry so prop updates flow through itemSlot.current.
  // Note: ctx is kept out of deps to avoid re-registration on every state change;
  // ctx.registerItem is stable (useCallback with no closures over render state).
  // biome-ignore lint/correctness/useExhaustiveDependencies: register once on mount
  useEffect(() => {
    return ctx.registerItem(itemSlot.current);
  }, []);

  // Native focusin listener — React 19 + jsdom can be flaky about routing
  // focusin to onFocus, so attach directly.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handler = () => {
      if (itemSlot.current.focusable) ctx.setCurrentTabStopId(id);
    };
    node.addEventListener('focusin', handler);
    node.addEventListener('focus', handler);
    return () => {
      node.removeEventListener('focusin', handler);
      node.removeEventListener('focus', handler);
    };
  }, [ctx, id]);

  const isCurrent = ctx.effectiveTabStopId === id;
  const tabIndex = isCurrent && focusable ? 0 : -1;

  const onFocus: FocusEventHandler<HTMLElement> = useCallback(() => {
    if (focusable) ctx.setCurrentTabStopId(id);
  }, [ctx, id, focusable]);

  const onMouseDown: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (!focusable) {
        event.preventDefault();
        return;
      }
      ctx.setCurrentTabStopId(id);
    },
    [ctx, id, focusable],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const intent = getFocusIntent(event.key, ctx.orientation, ctx.dir);
      if (!intent) return;
      event.preventDefault();

      const items = ctx.getFocusableItems();
      let candidates = items.map((item) => item.ref.current).filter(Boolean) as HTMLElement[];

      if (intent === 'first') {
        // already in DOM order
      } else if (intent === 'last') {
        candidates.reverse();
      } else {
        const currentIndex = candidates.indexOf(event.currentTarget as HTMLElement);
        if (intent === 'prev') candidates.reverse();
        const startIndex =
          (intent === 'prev' ? candidates.length - 1 - currentIndex : currentIndex) + 1;
        candidates = ctx.loop ? wrapArray(candidates, startIndex) : candidates.slice(startIndex);
      }

      // Defer focus to escape React's keydown batching.
      window.setTimeout(() => {
        focusFirst(candidates);
      }, 0);
    },
    [ctx],
  );

  return {
    tabIndex,
    ref: ref as Ref<HTMLElement>,
    onFocus,
    onMouseDown,
    onKeyDown,
  };
}

export const RovingFocusGroupItem = forwardRef<HTMLElement, RovingFocusGroupItemProps>(
  function RovingFocusGroupItem(props, forwardedRef) {
    const { asChild, active, focusable, id, onFocus, onMouseDown, onKeyDown, children, ...rest } =
      props;

    const itemProps = useRovingFocusGroupItem({ active, focusable, id });
    const composedRef = useMergedRefs<HTMLElement>(forwardedRef as Ref<HTMLElement>, itemProps.ref);

    const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
      onFocus?.(event);
      if (!event.defaultPrevented) itemProps.onFocus(event);
    };
    const handleMouseDown: MouseEventHandler<HTMLElement> = (event) => {
      onMouseDown?.(event);
      if (!event.defaultPrevented) itemProps.onMouseDown(event);
    };
    const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) itemProps.onKeyDown(event);
    };

    const Comp: React.ElementType = asChild ? Slot : 'span';

    return (
      <Comp
        tabIndex={itemProps.tabIndex}
        {...rest}
        ref={composedRef}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Comp>
    );
  },
);

RovingFocusGroupItem.displayName = 'RovingFocusGroupItem';

/* -------------------------------------------------------------------------- */
/* utils                                                                       */
/* -------------------------------------------------------------------------- */

type FocusIntent = 'first' | 'last' | 'prev' | 'next';

const KEY_TO_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageUp: 'first',
  Home: 'first',
  PageDown: 'last',
  End: 'last',
};

function getFocusIntent(
  key: string,
  orientation: RovingFocusOrientation,
  dir: RovingFocusDirection,
): FocusIntent | undefined {
  const adjustedKey =
    dir === 'rtl' && key === 'ArrowLeft'
      ? 'ArrowRight'
      : dir === 'rtl' && key === 'ArrowRight'
        ? 'ArrowLeft'
        : key;
  if (orientation === 'vertical' && (adjustedKey === 'ArrowLeft' || adjustedKey === 'ArrowRight')) {
    return undefined;
  }
  if (orientation === 'horizontal' && (adjustedKey === 'ArrowUp' || adjustedKey === 'ArrowDown')) {
    return undefined;
  }
  return KEY_TO_INTENT[adjustedKey];
}

function focusFirst(candidates: HTMLElement[]): void {
  const previously = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === previously) return;
    candidate.focus({ preventScroll: true });
    if (document.activeElement !== previously) return;
  }
}

function wrapArray<T>(array: T[], startIndex: number): T[] {
  return array.map((_, index) => array[(startIndex + index) % array.length] as T);
}
