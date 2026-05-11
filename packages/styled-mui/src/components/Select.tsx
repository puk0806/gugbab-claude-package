import {
  Select as Headless,
  type SelectContentProps,
  type SelectItemProps,
  type SelectRootProps,
  type SelectScrollButtonProps,
  type SelectTriggerProps,
} from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef, type HTMLAttributes } from 'react';

export type SelectSize = 'sm' | 'md';

export interface SelectStyledRootProps extends SelectRootProps {
  size?: SelectSize;
}

// Root does not render a DOM element — pass size via context would need extra work;
// instead we expose size on Trigger where it matters visually.
function Root({ children, ...rest }: SelectStyledRootProps) {
  return <Headless.Root {...rest}>{children}</Headless.Root>;
}

export interface SelectStyledTriggerProps extends SelectTriggerProps {
  size?: SelectSize;
}

const Trigger = forwardRef<HTMLButtonElement, SelectStyledTriggerProps>(function SelectTrigger(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Trigger
      ref={ref}
      className={cn('gmui-select__trigger', `gmui-select__trigger--${size}`, className)}
      {...rest}
    />
  );
});

const Value = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(function SelectValue({ className, ...rest }, ref) {
  return <Headless.Value ref={ref} className={cn('gmui-select__value', className)} {...rest} />;
});

function Portal({ children }: { children: React.ReactNode }) {
  return <Headless.Portal>{children}</Headless.Portal>;
}

const Content = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { className, ...rest },
  ref,
) {
  return <Headless.Content ref={ref} className={cn('gmui-select__content', className)} {...rest} />;
});

const Viewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SelectViewport(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Viewport ref={ref} className={cn('gmui-select__viewport', className)} {...rest} />
  );
});

const ScrollUpButton = forwardRef<HTMLDivElement, SelectScrollButtonProps>(
  function SelectScrollUpButton({ className, ...rest }, ref) {
    return (
      <Headless.ScrollUpButton
        ref={ref}
        className={cn('gmui-select__scroll-button gmui-select__scroll-button--up', className)}
        {...rest}
      />
    );
  },
);

const ScrollDownButton = forwardRef<HTMLDivElement, SelectScrollButtonProps>(
  function SelectScrollDownButton({ className, ...rest }, ref) {
    return (
      <Headless.ScrollDownButton
        ref={ref}
        className={cn('gmui-select__scroll-button gmui-select__scroll-button--down', className)}
        {...rest}
      />
    );
  },
);

const Item = forwardRef<HTMLButtonElement, SelectItemProps>(function SelectItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-select__item', className)} {...rest} />;
});

const ItemText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SelectItemText({ className, ...rest }, ref) {
    return (
      <Headless.ItemText ref={ref} className={cn('gmui-select__item-text', className)} {...rest} />
    );
  },
);

const Group = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SelectGroup(
  { className, ...rest },
  ref,
) {
  return <Headless.Group ref={ref} className={cn('gmui-select__group', className)} {...rest} />;
});

const Label = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SelectLabel(
  { className, ...rest },
  ref,
) {
  return <Headless.Label ref={ref} className={cn('gmui-select__label', className)} {...rest} />;
});

export const Select = {
  Root,
  Trigger,
  Value,
  Portal,
  Content,
  Viewport,
  ScrollUpButton,
  ScrollDownButton,
  Item,
  ItemText,
  Group,
  Label,
};
