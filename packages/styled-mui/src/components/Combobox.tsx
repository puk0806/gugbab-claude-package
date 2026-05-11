import {
  type ComboboxItemProps,
  type ComboboxRootProps,
  Combobox as Headless,
} from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'react';

export type ComboboxSize = 'sm' | 'md';

export interface ComboboxStyledRootProps extends ComboboxRootProps {
  size?: ComboboxSize;
}

function Root({ children, ...rest }: ComboboxStyledRootProps) {
  return <Headless.Root {...rest}>{children}</Headless.Root>;
}

const Anchor = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ComboboxAnchor(
  { className, ...rest },
  ref,
) {
  return <Headless.Anchor ref={ref} className={cn('gmui-combobox__anchor', className)} {...rest} />;
});

export interface ComboboxStyledInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: ComboboxSize;
}

const Input = forwardRef<HTMLInputElement, ComboboxStyledInputProps>(function ComboboxInput(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Input
      ref={ref}
      className={cn('gmui-combobox__input', `gmui-combobox__input--${size}`, className)}
      {...rest}
    />
  );
});

const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ComboboxTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger ref={ref} className={cn('gmui-combobox__trigger', className)} {...rest} />
    );
  },
);

function Portal({ children }: { children: React.ReactNode }) {
  return <Headless.Portal>{children}</Headless.Portal>;
}

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ComboboxContent(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Content ref={ref} className={cn('gmui-combobox__content', className)} {...rest} />
  );
});

const Item = forwardRef<HTMLButtonElement, ComboboxItemProps>(function ComboboxItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-combobox__item', className)} {...rest} />;
});

export const Combobox = { Root, Anchor, Input, Trigger, Portal, Content, Item };
