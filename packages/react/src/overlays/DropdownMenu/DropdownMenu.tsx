import {
  FloatingList,
  FloatingPortal,
  type Placement,
  safePolygon,
  useClick,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import {
  DismissableLayer,
  type EscapeKeyDownEvent,
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
} from '../../shared/DismissableLayer';
import { FocusScope } from '../../shared/FocusScope';
import { usePresence } from '../../shared/usePresence';
import { useFloatingBase } from '../_floatingBase';

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  onEscapeKeyDown?: (event: EscapeKeyDownEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  context: ReturnType<typeof useFloatingBase>['context'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  elementsRef: React.RefObject<Array<HTMLElement | null>>;
  labelsRef: React.RefObject<Array<string | null>>;
  activeIndex: number | null;
  contentId: string;
}

const Ctx = createContext<DropdownMenuContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <DropdownMenu.Root>`);
  return ctx;
};

export interface DropdownMenuRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  children: React.ReactNode;
}

function DropdownMenuRoot({
  open,
  defaultOpen,
  onOpenChange,
  placement = 'bottom-start',
  children,
}: DropdownMenuRootProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement,
  });

  const click = useClick(floating.context);
  const role = useRole(floating.context, { role: 'menu' });
  const listNav = useListNavigation(floating.context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    role,
    listNav,
  ]);
  const contentId = useId();

  return (
    <Ctx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs: floating.refs,
        context: floating.context,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        elementsRef,
        labelsRef,
        activeIndex,
        contentId,
      }}
    >
      <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
        {children}
      </FloatingList>
    </Ctx.Provider>
  );
}

const Trigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ asChild, ...props }, ref) {
    const ctx = useCtx('DropdownMenu.Trigger');
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
        aria-haspopup="menu"
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        data-state={ctx.open ? 'open' : 'closed'}
        {...refProps}
      />
    );
  },
);

export interface DropdownMenuPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: DropdownMenuPortalProps) {
  const ctx = useCtx('DropdownMenu.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

const Content = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  {
    forceMount,
    style,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onEscapeKeyDown,
    onOpenAutoFocus,
    onCloseAutoFocus,
    ...props
  },
  ref,
) {
  const ctx = useCtx('DropdownMenu.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;
  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onDismiss={() => ctx.setOpen(false)}
    >
      <FocusScope
        asChild
        trapped={false}
        loop
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <div
          ref={(node) => {
            ctx.refs.setFloating(node);
            presenceRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={ctx.contentId}
          style={{ ...ctx.floatingStyles, ...style }}
          data-state={ctx.open ? 'open' : 'closed'}
          {...ctx.getFloatingProps(props)}
        />
      </FocusScope>
    </DismissableLayer>
  );
});

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: () => void;
  asChild?: boolean;
  /** Plain-text label used for typeahead. Defaults to children when string. */
  label?: string;
}

const Item = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { onSelect, onClick, type = 'button', disabled, asChild, label, children, ...rest },
  ref,
) {
  const ctx = useCtx('DropdownMenu.Item');
  const inferredLabel = label ?? (typeof children === 'string' ? children : null);
  const { ref: itemRef } = useListItem({ label: inferredLabel });
  const Comp = asChild ? Slot : 'button';
  const setRef = (node: HTMLButtonElement | null) => {
    itemRef(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const itemProps = ctx.getItemProps({
    ...rest,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && !disabled) {
        onSelect?.();
        ctx.setOpen(false);
      }
    },
  }) as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <Comp
      ref={setRef}
      type={asChild ? undefined : type}
      role="menuitem"
      disabled={disabled}
      data-disabled={disabled ? '' : undefined}
      {...itemProps}
    >
      {children}
    </Comp>
  );
});

const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator(props, ref) {
    return <div ref={ref} role="separator" {...props} />;
  },
);

const Label = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuLabel(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

interface ItemIndicatorContextValue {
  checked: boolean;
}
const ItemIndicatorContext = createContext<ItemIndicatorContextValue | null>(null);

export interface DropdownMenuCheckboxItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: () => void;
  asChild?: boolean;
  label?: string;
}

const CheckboxItem = forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
  function DropdownMenuCheckboxItem(
    {
      checked,
      defaultChecked,
      onCheckedChange,
      onSelect,
      onClick,
      type = 'button',
      disabled,
      asChild,
      label,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useCtx('DropdownMenu.CheckboxItem');
    const [isChecked, setChecked] = useControllableState<boolean>({
      value: checked,
      defaultValue: defaultChecked ?? false,
      onChange: onCheckedChange,
    });
    const inferredLabel = label ?? (typeof children === 'string' ? children : null);
    const { ref: itemRef } = useListItem({ label: inferredLabel });
    const Comp = asChild ? Slot : 'button';
    const setRef = (node: HTMLButtonElement | null) => {
      itemRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    const itemProps = ctx.getItemProps({
      ...rest,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) {
          setChecked(!isChecked);
          onSelect?.();
          ctx.setOpen(false);
        }
      },
    }) as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <ItemIndicatorContext.Provider value={{ checked: isChecked }}>
        <Comp
          ref={setRef}
          type={asChild ? undefined : type}
          role="menuitemcheckbox"
          aria-checked={isChecked}
          disabled={disabled}
          data-state={isChecked ? 'checked' : 'unchecked'}
          data-disabled={disabled ? '' : undefined}
          {...itemProps}
        >
          {children}
        </Comp>
      </ItemIndicatorContext.Provider>
    );
  },
);

interface RadioGroupContextValue {
  value: string;
  setValue: (v: string) => void;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface DropdownMenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

const RadioGroup = forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  function DropdownMenuRadioGroup({ value, defaultValue, onValueChange, children, ...rest }, ref) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    });
    return (
      <RadioGroupContext.Provider value={{ value: current, setValue: (v) => setCurrent(v) }}>
        <div ref={ref} role="group" {...rest}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

export interface DropdownMenuRadioItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onSelect'> {
  value: string;
  onSelect?: () => void;
  asChild?: boolean;
  label?: string;
}

const RadioItem = forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem(
    {
      value: itemValue,
      onSelect,
      onClick,
      type = 'button',
      disabled,
      asChild,
      label,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useCtx('DropdownMenu.RadioItem');
    const group = useContext(RadioGroupContext);
    if (!group)
      throw new Error('DropdownMenu.RadioItem must be used inside <DropdownMenu.RadioGroup>');
    const checked = group.value === itemValue;
    const inferredLabel = label ?? (typeof children === 'string' ? children : null);
    const { ref: itemRef } = useListItem({ label: inferredLabel });
    const Comp = asChild ? Slot : 'button';
    const setRef = (node: HTMLButtonElement | null) => {
      itemRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    const itemProps = ctx.getItemProps({
      ...rest,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) {
          group.setValue(itemValue);
          onSelect?.();
          ctx.setOpen(false);
        }
      },
    }) as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <ItemIndicatorContext.Provider value={{ checked }}>
        <Comp
          ref={setRef}
          type={asChild ? undefined : type}
          role="menuitemradio"
          aria-checked={checked}
          disabled={disabled}
          data-state={checked ? 'checked' : 'unchecked'}
          data-disabled={disabled ? '' : undefined}
          {...itemProps}
        >
          {children}
        </Comp>
      </ItemIndicatorContext.Provider>
    );
  },
);

export interface DropdownMenuItemIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  forceMount?: boolean;
}

const ItemIndicator = forwardRef<HTMLSpanElement, DropdownMenuItemIndicatorProps>(
  function DropdownMenuItemIndicator({ forceMount, ...rest }, ref) {
    const indicator = useContext(ItemIndicatorContext);
    if (!indicator)
      throw new Error(
        'DropdownMenu.ItemIndicator must be used inside <DropdownMenu.CheckboxItem> or <DropdownMenu.RadioItem>',
      );
    if (!indicator.checked && !forceMount) return null;
    return <span ref={ref} data-state={indicator.checked ? 'checked' : 'unchecked'} {...rest} />;
  },
);

/* -------------------------------------------------------------------------------------------------
 * Sub (nested submenu)
 * -----------------------------------------------------------------------------------------------*/

interface SubContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  refs: ReturnType<typeof useFloatingBase>['refs'];
  context: ReturnType<typeof useFloatingBase>['context'];
  floatingStyles: ReturnType<typeof useFloatingBase>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  elementsRef: React.RefObject<Array<HTMLElement | null>>;
  labelsRef: React.RefObject<Array<string | null>>;
  parent: DropdownMenuContextValue;
}
const SubCtx = createContext<SubContextValue | null>(null);
const useSubCtx = (n: string) => {
  const ctx = useContext(SubCtx);
  if (!ctx) throw new Error(`${n} must be used inside <DropdownMenu.Sub>`);
  return ctx;
};

export interface DropdownMenuSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function Sub({ open, defaultOpen, onOpenChange, children }: DropdownMenuSubProps) {
  const parent = useCtx('DropdownMenu.Sub');
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (v) => setOpen(v),
    placement: 'right-start',
  });

  const hover = useHover(floating.context, {
    enabled: true,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(floating.context, {
    event: 'mousedown',
    toggle: false,
    ignoreMouse: true,
  });
  const role = useRole(floating.context, { role: 'menu' });
  const listNav = useListNavigation(floating.context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    nested: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    role,
    listNav,
  ]);

  // close sub when parent closes
  useEffect(() => {
    if (!parent.open && isOpen) setOpen(false);
  }, [parent.open, isOpen, setOpen]);

  return (
    <SubCtx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => setOpen(v),
        refs: floating.refs,
        context: floating.context,
        floatingStyles: floating.floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        elementsRef,
        labelsRef,
        parent,
      }}
    >
      <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
        {children}
      </FloatingList>
    </SubCtx.Provider>
  );
}

export interface DropdownMenuSubTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  label?: string;
}

const SubTrigger = forwardRef<HTMLButtonElement, DropdownMenuSubTriggerProps>(
  function DropdownMenuSubTrigger(
    { asChild, label, type = 'button', disabled, onKeyDown, children, ...rest },
    ref,
  ) {
    const sub = useSubCtx('DropdownMenu.SubTrigger');
    const inferredLabel = label ?? (typeof children === 'string' ? children : null);
    // register in PARENT list so keyboard nav in parent menu reaches the trigger
    const parentItem = useListItem({ label: inferredLabel });
    const Comp = asChild ? Slot : 'button';

    const setRef = (node: HTMLButtonElement | null) => {
      parentItem.ref(node);
      sub.refs.setReference(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      // ArrowRight (LTR) opens sub menu and focuses first item
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        sub.setOpen(true);
      }
    };

    // compose parent's getItemProps + sub's getReferenceProps
    const merged = sub.getReferenceProps({
      ...sub.parent.getItemProps({ ...rest }),
    }) as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <Comp
        ref={setRef}
        type={asChild ? undefined : type}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub.open}
        data-state={sub.open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        {...merged}
      >
        {children}
      </Comp>
    );
  },
);

export interface DropdownMenuSubContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  onEscapeKeyDown?: (event: EscapeKeyDownEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

const SubContent = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function DropdownMenuSubContent(
    {
      forceMount,
      style,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onEscapeKeyDown,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) {
    const sub = useSubCtx('DropdownMenu.SubContent');
    const { mounted, presenceRef } = usePresence<HTMLDivElement>(sub.open);
    if (!mounted && !forceMount) return null;
    return (
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={false}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={onFocusOutside}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        onDismiss={() => sub.setOpen(false)}
      >
        <FocusScope
          asChild
          trapped={false}
          loop
          onMountAutoFocus={onOpenAutoFocus}
          onUnmountAutoFocus={onCloseAutoFocus}
        >
          <div
            ref={(node) => {
              sub.refs.setFloating(node);
              presenceRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            style={{ ...sub.floatingStyles, ...style }}
            data-state={sub.open ? 'open' : 'closed'}
            {...sub.getFloatingProps(props)}
          />
        </FocusScope>
      </DismissableLayer>
    );
  },
);

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger,
  Portal,
  Content,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Label,
  Sub,
  SubTrigger,
  SubContent,
};
