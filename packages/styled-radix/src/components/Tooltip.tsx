import { Tooltip as Headless, type TooltipRootProps } from '@gugbab/headless';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '../utils/cn';

const Trigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Trigger>>(
  function TooltipTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger ref={ref} className={cn('grx-tooltip__trigger', className)} {...rest} />
    );
  },
);

const Content = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Headless.Content>>(
  function TooltipContent({ className, ...rest }, ref) {
    return (
      <Headless.Content ref={ref} className={cn('grx-tooltip__content', className)} {...rest} />
    );
  },
);

export type { TooltipRootProps };

export const Tooltip = {
  Provider: Headless.Provider,
  Root: Headless.Root,
  Trigger,
  Portal: Headless.Portal,
  Content,
};
