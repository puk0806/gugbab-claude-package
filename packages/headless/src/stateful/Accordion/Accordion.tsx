import { useControllableState, useMergedRefs } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type Ref,
  useCallback,
  useContext,
  useId,
  useMemo,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { type Direction, useDirection } from '../../shared/DirectionProvider';
import { RovingFocusGroup, useRovingFocusGroupItem } from '../../shared/RovingFocusGroup';
import { usePresence } from '../../shared/usePresence';

type Orientation = 'horizontal' | 'vertical';

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

interface AccordionContextValue {
  type: 'single' | 'multiple';
  value: string[];
  disabled: boolean;
  collapsible: boolean;
  orientation: Orientation;
  dir: 'ltr' | 'rtl';
  toggle: (itemValue: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(consumer: string) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Accordion.Root>`);
  return ctx;
}

interface AccordionCommonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  disabled?: boolean;
  orientation?: Orientation;
  dir?: Direction;
}
interface AccordionSingleProps extends AccordionCommonProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
}
interface AccordionMultipleProps extends AccordionCommonProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionRootProps =
  | (AccordionSingleProps & { type: 'single' })
  | (AccordionMultipleProps & { type: 'multiple' });

const Root = forwardRef<HTMLDivElement, AccordionRootProps>(function AccordionRoot(props, ref) {
  if (props.type === 'single') {
    const { type: _t, disabled = false, ...rest } = props;
    return <SingleRoot ref={ref} disabled={disabled} {...rest} />;
  }
  const { type: _t, disabled = false, ...rest } = props;
  return <MultipleRoot ref={ref} disabled={disabled} {...rest} />;
});

const SingleRoot = forwardRef<HTMLDivElement, AccordionSingleProps & { disabled: boolean }>(
  function AccordionSingleRoot(
    {
      value,
      defaultValue,
      onValueChange,
      collapsible = false,
      disabled,
      orientation = 'vertical',
      dir,
      ...rest
    },
    ref,
  ) {
    const resolvedDir = useDirection(dir);
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    });
    const values = useMemo(() => (current ? [current] : []), [current]);
    const toggle = useCallback(
      (itemValue: string) => {
        if (current === itemValue) {
          if (collapsible) setCurrent('');
        } else {
          setCurrent(itemValue);
        }
      },
      [current, collapsible, setCurrent],
    );

    const ctxValue = useMemo<AccordionContextValue>(
      () => ({
        type: 'single',
        value: values,
        disabled,
        collapsible,
        orientation,
        dir: resolvedDir,
        toggle,
      }),
      [values, disabled, collapsible, orientation, resolvedDir, toggle],
    );

    return (
      <AccordionContext.Provider value={ctxValue}>
        <Impl ref={ref} disabled={disabled} orientation={orientation} dir={resolvedDir} {...rest} />
      </AccordionContext.Provider>
    );
  },
);

const MultipleRoot = forwardRef<HTMLDivElement, AccordionMultipleProps & { disabled: boolean }>(
  function AccordionMultipleRoot(
    { value, defaultValue, onValueChange, disabled, orientation = 'vertical', dir, ...rest },
    ref,
  ) {
    const resolvedDir = useDirection(dir);
    const [current, setCurrent] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
    });
    const toggle = useCallback(
      (itemValue: string) => {
        setCurrent((prev) =>
          prev.includes(itemValue) ? prev.filter((v) => v !== itemValue) : [...prev, itemValue],
        );
      },
      [setCurrent],
    );

    const ctxValue = useMemo<AccordionContextValue>(
      () => ({
        type: 'multiple',
        value: current,
        disabled,
        collapsible: true,
        orientation,
        dir: resolvedDir,
        toggle,
      }),
      [current, disabled, orientation, resolvedDir, toggle],
    );

    return (
      <AccordionContext.Provider value={ctxValue}>
        <Impl ref={ref} disabled={disabled} orientation={orientation} dir={resolvedDir} {...rest} />
      </AccordionContext.Provider>
    );
  },
);

interface ImplProps extends HTMLAttributes<HTMLDivElement> {
  disabled: boolean;
  orientation: Orientation;
  dir: 'ltr' | 'rtl';
}

const Impl = forwardRef<HTMLDivElement, ImplProps>(function AccordionImpl(
  { disabled, orientation, dir, ...rest },
  ref,
) {
  return (
    <RovingFocusGroup asChild orientation={orientation} dir={dir} loop>
      <div ref={ref} data-orientation={orientation} {...rest} />
    </RovingFocusGroup>
  );
});

interface AccordionItemContextValue {
  open: boolean;
  disabled: boolean;
  value: string;
  triggerId: string;
  contentId: string;
}
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);
function useAccordionItemContext(consumer: string) {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Accordion.Item>`);
  return ctx;
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const Item = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled, ...rest },
  ref,
) {
  const root = useAccordionContext('Accordion.Item');
  const open = root.value.includes(value);
  const itemDisabled = disabled ?? root.disabled;
  const triggerId = useId();
  const contentId = useId();
  const itemCtxValue = useMemo<AccordionItemContextValue>(
    () => ({ open, disabled: itemDisabled, value, triggerId, contentId }),
    [open, itemDisabled, value, triggerId, contentId],
  );

  return (
    <AccordionItemContext.Provider value={itemCtxValue}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={itemDisabled ? '' : undefined}
        data-orientation={root.orientation}
        {...rest}
      />
    </AccordionItemContext.Provider>
  );
});

export interface AccordionHeaderProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level — match the page outline (WCAG 1.3.1).
   * @defaultValue 3
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

const Header = forwardRef<HTMLHeadingElement, AccordionHeaderProps>(function AccordionHeader(
  { level = 3, ...props },
  ref,
) {
  const root = useAccordionContext('Accordion.Header');
  const item = useAccordionItemContext('Accordion.Header');
  // Out-of-range input (untyped callers) falls back to the default h3.
  const Tag = HEADING_TAGS[level - 1] ?? 'h3';
  return (
    <Tag
      ref={ref}
      data-state={item.open ? 'open' : 'closed'}
      data-disabled={item.disabled ? '' : undefined}
      data-orientation={root.orientation}
      {...props}
    />
  );
});

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { onClick, onFocus, onMouseDown, onKeyDown, type = 'button', disabled, asChild, ...rest },
  ref,
) {
  const root = useAccordionContext('Accordion.Trigger');
  const item = useAccordionItemContext('Accordion.Trigger');
  const finalDisabled = disabled ?? item.disabled;
  // single mode: open trigger cannot be closed → ARIA disabled
  const ariaLocked = root.type === 'single' && item.open && !root.collapsible;

  const rovingProps = useRovingFocusGroupItem({
    active: item.open,
    focusable: !finalDisabled,
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
      id={item.triggerId}
      aria-controls={item.contentId}
      aria-expanded={item.open}
      aria-disabled={ariaLocked || undefined}
      data-state={item.open ? 'open' : 'closed'}
      data-disabled={finalDisabled ? '' : undefined}
      data-orientation={root.orientation}
      data-accordion-trigger=""
      disabled={finalDisabled}
      tabIndex={rovingProps.tabIndex}
      onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        if (!e.defaultPrevented) rovingProps.onFocus(e);
      }}
      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
        onMouseDown?.(e);
        if (!e.defaultPrevented) rovingProps.onMouseDown(e);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) rovingProps.onKeyDown(e);
      }}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !finalDisabled && !ariaLocked) root.toggle(item.value);
      }}
      {...rest}
    />
  );
});

const Content = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent(
  { forceMount, ...props },
  ref,
) {
  const root = useAccordionContext('Accordion.Content');
  const item = useAccordionItemContext('Accordion.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(item.open);
  const composedRef = useMergedRefs<HTMLDivElement>(presenceRef, ref);
  if (!mounted && !forceMount) return null;
  return (
    <div
      ref={composedRef}
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      data-state={item.open ? 'open' : 'closed'}
      data-orientation={root.orientation}
      hidden={!item.open}
      {...props}
    />
  );
});

export const Accordion = { Root, Item, Header, Trigger, Content };
