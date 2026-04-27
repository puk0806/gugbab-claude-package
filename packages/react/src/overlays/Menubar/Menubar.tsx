import {
  FloatingList,
  FloatingPortal,
  type Placement,
  safePolygon,
  useClick,
  useDismiss,
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
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
} from '../../shared/DismissableLayer';
import { FocusScope } from '../../shared/FocusScope';
import { usePresence } from '../../shared/usePresence';
import { useFloatingBase } from '../_floatingBase';

/* -------------------------------------------------------------------------------------------------
 * Menubar context
 * -----------------------------------------------------------------------------------------------*/

interface MenubarContextValue {
  value: string;
  setValue: (v: string) => void;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);
function useMenubarContext(consumer: string) {
  const ctx = useContext(MenubarContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Menubar.Root>`);
  return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarRootProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Root = forwardRef<HTMLDivElement, MenubarRootProps>(function MenubarRoot(
  { value, defaultValue, onValueChange, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  return (
    <MenubarContext.Provider value={{ value: current, setValue: (v) => setCurrent(v) }}>
      <div ref={ref} role="menubar" {...rest} />
    </MenubarContext.Provider>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Menu (per-trigger dropdown within the Menubar)
 * -----------------------------------------------------------------------------------------------*/

interface MenuContextValue {
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

const MenuCtx = createContext<MenuContextValue | null>(null);
const useMenuCtx = (n: string) => {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error(`${n} must be used inside <Menubar.Menu>`);
  return ctx;
};

export interface MenubarMenuProps {
  value: string;
  placement?: Placement;
  children: ReactNode;
}

function Menu({ value, placement = 'bottom-start', children }: MenubarMenuProps) {
  const bar = useMenubarContext('Menubar.Menu');
  const isOpen = bar.value === value;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const floating = useFloatingBase({
    open: isOpen,
    onOpenChange: (next) => bar.setValue(next ? value : ''),
    placement,
  });

  const click = useClick(floating.context);
  // floating-ui dismiss is kept for pointer-outside detection that feeds
  // back into Menubar state; DismissableLayer handles Escape + callbacks.
  const dismiss = useDismiss(floating.context, { escapeKey: false });
  const role = useRole(floating.context, { role: 'menu' });
  const listNav = useListNavigation(floating.context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
  ]);
  const contentId = useId();

  return (
    <MenuCtx.Provider
      value={{
        open: isOpen,
        setOpen: (v) => bar.setValue(v ? value : ''),
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
    </MenuCtx.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { asChild, ...props },
  ref,
) {
  const ctx = useMenuCtx('Menubar.Trigger');
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
});

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarPortalProps {
  children?: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: MenubarPortalProps) {
  const ctx = useMenuCtx('Menubar.Portal');
  if (!ctx.open && !forceMount) return null;
  return <FloatingPortal root={container}>{children}</FloatingPortal>;
}

/* -------------------------------------------------------------------------------------------------
 * Content
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  asChild?: boolean;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

const Content = forwardRef<HTMLDivElement, MenubarContentProps>(function MenubarContent(
  {
    forceMount,
    asChild,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onEscapeKeyDown,
    onOpenAutoFocus,
    onCloseAutoFocus,
    style,
    ...props
  },
  ref,
) {
  const ctx = useMenuCtx('Menubar.Content');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(ctx.open);
  if (!mounted && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';

  const composeRef = (node: HTMLDivElement | null) => {
    ctx.refs.setFloating(node);
    presenceRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={(event) => {
        onEscapeKeyDown?.(event as unknown as KeyboardEvent);
      }}
      onDismiss={() => ctx.setOpen(false)}
    >
      <FocusScope
        asChild
        trapped={false}
        loop
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <Comp
          ref={composeRef}
          id={ctx.contentId}
          style={{ ...ctx.floatingStyles, ...style }}
          data-state={ctx.open ? 'open' : 'closed'}
          {...ctx.getFloatingProps(props)}
        />
      </FocusScope>
    </DismissableLayer>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Item / shared primitives
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: () => void;
  asChild?: boolean;
  label?: string;
}

const Item = forwardRef<HTMLButtonElement, MenubarItemProps>(function MenubarItem(
  { onSelect, onClick, type = 'button', disabled, asChild, label, children, ...rest },
  ref,
) {
  const ctx = useMenuCtx('Menubar.Item');
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
  function MenubarSeparator(props, ref) {
    return <div ref={ref} role="separator" {...props} />;
  },
);

const Label = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MenubarLabel(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

/* -------------------------------------------------------------------------------------------------
 * CheckboxItem
 * -----------------------------------------------------------------------------------------------*/

interface ItemIndicatorContextValue {
  checked: boolean;
}
const ItemIndicatorContext = createContext<ItemIndicatorContextValue | null>(null);

export interface MenubarCheckboxItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: () => void;
  asChild?: boolean;
  label?: string;
}

const CheckboxItem = forwardRef<HTMLButtonElement, MenubarCheckboxItemProps>(
  function MenubarCheckboxItem(
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
    const ctx = useMenuCtx('Menubar.CheckboxItem');
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

/* -------------------------------------------------------------------------------------------------
 * RadioGroup / RadioItem
 * -----------------------------------------------------------------------------------------------*/

interface RadioGroupContextValue {
  value: string;
  setValue: (v: string) => void;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface MenubarRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

const RadioGroup = forwardRef<HTMLDivElement, MenubarRadioGroupProps>(function MenubarRadioGroup(
  { value, defaultValue, onValueChange, children, ...rest },
  ref,
) {
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
});

export interface MenubarRadioItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onSelect'> {
  value: string;
  onSelect?: () => void;
  asChild?: boolean;
  label?: string;
}

const RadioItem = forwardRef<HTMLButtonElement, MenubarRadioItemProps>(function MenubarRadioItem(
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
  const ctx = useMenuCtx('Menubar.RadioItem');
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error('Menubar.RadioItem must be used inside <Menubar.RadioGroup>');
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
});

/* -------------------------------------------------------------------------------------------------
 * ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarItemIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  forceMount?: boolean;
}

const ItemIndicator = forwardRef<HTMLSpanElement, MenubarItemIndicatorProps>(
  function MenubarItemIndicator({ forceMount, ...rest }, ref) {
    const indicator = useContext(ItemIndicatorContext);
    if (!indicator)
      throw new Error(
        'Menubar.ItemIndicator must be used inside <Menubar.CheckboxItem> or <Menubar.RadioItem>',
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
  parent: MenuContextValue;
}
const SubCtx = createContext<SubContextValue | null>(null);
const useSubCtx = (n: string) => {
  const ctx = useContext(SubCtx);
  if (!ctx) throw new Error(`${n} must be used inside <Menubar.Sub>`);
  return ctx;
};

export interface MenubarSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function Sub({ open, defaultOpen, onOpenChange, children }: MenubarSubProps) {
  const parent = useMenuCtx('Menubar.Sub');
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
  const dismiss = useDismiss(floating.context, { bubbles: true, escapeKey: false });
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
    dismiss,
    role,
    listNav,
  ]);

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

/* -------------------------------------------------------------------------------------------------
 * SubTrigger
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarSubTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  label?: string;
}

const SubTrigger = forwardRef<HTMLButtonElement, MenubarSubTriggerProps>(function MenubarSubTrigger(
  { asChild, label, type = 'button', disabled, onKeyDown, children, ...rest },
  ref,
) {
  const sub = useSubCtx('Menubar.SubTrigger');
  const inferredLabel = label ?? (typeof children === 'string' ? children : null);
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
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      sub.setOpen(true);
    }
  };

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
});

/* -------------------------------------------------------------------------------------------------
 * SubContent
 * -----------------------------------------------------------------------------------------------*/

export interface MenubarSubContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  asChild?: boolean;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

const SubContent = forwardRef<HTMLDivElement, MenubarSubContentProps>(function MenubarSubContent(
  {
    forceMount,
    asChild,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onEscapeKeyDown,
    onOpenAutoFocus,
    onCloseAutoFocus,
    style,
    ...props
  },
  ref,
) {
  const sub = useSubCtx('Menubar.SubContent');
  const { mounted, presenceRef } = usePresence<HTMLDivElement>(sub.open);
  if (!mounted && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={(event) => {
        onEscapeKeyDown?.(event as unknown as KeyboardEvent);
      }}
      onDismiss={() => sub.setOpen(false)}
    >
      <FocusScope
        asChild
        trapped={false}
        loop
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <Comp
          ref={(node: HTMLDivElement | null) => {
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
});

/* -------------------------------------------------------------------------------------------------
 * Export
 * -----------------------------------------------------------------------------------------------*/

export const Menubar = {
  Root,
  Menu,
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
