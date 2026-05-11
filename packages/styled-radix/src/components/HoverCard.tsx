import { HoverCard as Headless, type HoverCardRootProps } from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

const Trigger = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<typeof Headless.Trigger>>(
  function HoverCardTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger ref={ref} className={cn('grx-hover-card__trigger', className)} {...rest} />
    );
  },
);

const Content = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Headless.Content>>(
  function HoverCardContent({ className, ...rest }, ref) {
    return (
      <Headless.Content ref={ref} className={cn('grx-hover-card__content', className)} {...rest} />
    );
  },
);

export type { HoverCardRootProps };

export const HoverCard = {
  Root: Headless.Root,
  Trigger,
  Portal: Headless.Portal,
  Content,
};
