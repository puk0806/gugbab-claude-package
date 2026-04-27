import { useControllableState } from '@gugbab-ui/hooks';
import { createContext, forwardRef, type HTMLAttributes, type ReactNode, useContext } from 'react';
import { DropdownMenu, type DropdownMenuRootProps } from '../DropdownMenu/DropdownMenu';

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

export interface MenubarMenuProps extends Omit<DropdownMenuRootProps, 'open' | 'onOpenChange'> {
  value: string;
  children: ReactNode;
}

function Menu({ value, children, ...rest }: MenubarMenuProps) {
  const ctx = useMenubarContext('Menubar.Menu');
  const isOpen = ctx.value === value;
  return (
    <DropdownMenu.Root
      {...rest}
      open={isOpen}
      onOpenChange={(next) => {
        ctx.setValue(next ? value : '');
      }}
    >
      {children}
    </DropdownMenu.Root>
  );
}

export const Menubar = {
  Root,
  Menu,
  Trigger: DropdownMenu.Trigger,
  Portal: DropdownMenu.Portal,
  Content: DropdownMenu.Content,
  Item: DropdownMenu.Item,
  CheckboxItem: DropdownMenu.CheckboxItem,
  RadioGroup: DropdownMenu.RadioGroup,
  RadioItem: DropdownMenu.RadioItem,
  ItemIndicator: DropdownMenu.ItemIndicator,
  Separator: DropdownMenu.Separator,
  Label: DropdownMenu.Label,
  Sub: DropdownMenu.Sub,
  SubTrigger: DropdownMenu.SubTrigger,
  SubContent: DropdownMenu.SubContent,
};
