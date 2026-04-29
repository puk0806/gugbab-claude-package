import {
  type DialogContentProps,
  type DialogRootProps,
  type DialogTriggerProps,
  Dialog as Headless,
} from '@gugbab-ui/headless';
import { type ComponentPropsWithoutRef, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogContentStyledProps extends DialogContentProps {
  size?: DialogSize;
}

const Overlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogOverlay(
  { className, ...rest },
  ref,
) {
  return <Headless.Overlay ref={ref} className={cn('gmui-dialog__overlay', className)} {...rest} />;
});

const Content = forwardRef<HTMLDivElement, DialogContentStyledProps>(function DialogContent(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Content
      ref={ref}
      className={cn('gmui-dialog__content', `gmui-dialog__content--${size}`, className)}
      {...rest}
    />
  );
});

const Title = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<typeof Headless.Title>>(
  function DialogTitle({ className, ...rest }, ref) {
    return <Headless.Title ref={ref} className={cn('gmui-dialog__title', className)} {...rest} />;
  },
);

const Description = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof Headless.Description>
>(function DialogDescription({ className, ...rest }, ref) {
  return (
    <Headless.Description
      ref={ref}
      className={cn('gmui-dialog__description', className)}
      {...rest}
    />
  );
});

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger(
  { className, ...rest },
  ref,
) {
  return <Headless.Trigger ref={ref} className={cn('gmui-dialog__trigger', className)} {...rest} />;
});

const Close = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Close>>(
  function DialogClose({ className, ...rest }, ref) {
    return <Headless.Close ref={ref} className={cn('gmui-dialog__close', className)} {...rest} />;
  },
);

export type { DialogContentProps, DialogRootProps, DialogTriggerProps };

export const Dialog = {
  Root: Headless.Root,
  Trigger,
  Portal: Headless.Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
};
