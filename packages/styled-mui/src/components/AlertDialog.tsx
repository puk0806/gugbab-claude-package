import {
  type AlertDialogRootProps,
  type DialogContentProps,
  AlertDialog as Headless,
} from '@gugbab/headless';
import { type ComponentPropsWithoutRef, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type AlertDialogSize = 'sm' | 'md' | 'lg' | 'xl';
export type AlertDialogActionVariant = 'accent' | 'danger';

export interface AlertDialogContentStyledProps extends DialogContentProps {
  size?: AlertDialogSize;
}

export interface AlertDialogActionProps extends ComponentPropsWithoutRef<typeof Headless.Action> {
  variant?: AlertDialogActionVariant;
}

const Overlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AlertDialogOverlay({ className, ...rest }, ref) {
    return (
      <Headless.Overlay
        ref={ref}
        className={cn('gmui-alert-dialog__overlay', className)}
        {...rest}
      />
    );
  },
);

const Content = forwardRef<HTMLDivElement, AlertDialogContentStyledProps>(
  function AlertDialogContent({ size = 'md', className, ...rest }, ref) {
    return (
      <Headless.Content
        ref={ref}
        className={cn(
          'gmui-alert-dialog__content',
          `gmui-alert-dialog__content--${size}`,
          className,
        )}
        {...rest}
      />
    );
  },
);

const Title = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<typeof Headless.Title>>(
  function AlertDialogTitle({ className, ...rest }, ref) {
    return (
      <Headless.Title ref={ref} className={cn('gmui-alert-dialog__title', className)} {...rest} />
    );
  },
);

const Description = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof Headless.Description>
>(function AlertDialogDescription({ className, ...rest }, ref) {
  return (
    <Headless.Description
      ref={ref}
      className={cn('gmui-alert-dialog__description', className)}
      {...rest}
    />
  );
});

const Trigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Trigger>>(
  function AlertDialogTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger
        ref={ref}
        className={cn('gmui-alert-dialog__trigger', className)}
        {...rest}
      />
    );
  },
);

const Cancel = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Cancel>>(
  function AlertDialogCancel({ className, ...rest }, ref) {
    return (
      <Headless.Cancel ref={ref} className={cn('gmui-alert-dialog__cancel', className)} {...rest} />
    );
  },
);

const Action = forwardRef<HTMLButtonElement, AlertDialogActionProps>(function AlertDialogAction(
  { variant = 'accent', className, ...rest },
  ref,
) {
  return (
    <Headless.Action
      ref={ref}
      className={cn(
        'gmui-alert-dialog__action',
        `gmui-alert-dialog__action--${variant}`,
        className,
      )}
      {...rest}
    />
  );
});

export type { AlertDialogRootProps };

export const AlertDialog = {
  Root: Headless.Root,
  Trigger,
  Portal: Headless.Portal,
  Overlay,
  Content,
  Title,
  Description,
  Cancel,
  Action,
};
