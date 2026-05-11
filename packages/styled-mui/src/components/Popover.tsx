import {
  Popover as Headless,
  type PopoverContentProps,
  type PopoverRootProps,
} from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

const Trigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Trigger>>(
  function PopoverTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger ref={ref} className={cn('gmui-popover__trigger', className)} {...rest} />
    );
  },
);

const Anchor = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Headless.Anchor>>(
  function PopoverAnchor({ className, ...rest }, ref) {
    return (
      <Headless.Anchor ref={ref} className={cn('gmui-popover__anchor', className)} {...rest} />
    );
  },
);

const Content = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Content ref={ref} className={cn('gmui-popover__content', className)} {...rest} />
  );
});

const Close = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Close>>(
  function PopoverClose({ className, ...rest }, ref) {
    return <Headless.Close ref={ref} className={cn('gmui-popover__close', className)} {...rest} />;
  },
);

export type { PopoverContentProps, PopoverRootProps };

export const Popover = {
  Root: Headless.Root,
  Trigger,
  Anchor,
  Portal: Headless.Portal,
  Content,
  Close,
};
