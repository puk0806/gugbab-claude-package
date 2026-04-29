import { type CollapsibleRootProps, Collapsible as Headless } from '@gugbab-ui/headless';
import { type ButtonHTMLAttributes, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>(function CollapsibleRoot(
  { className, ...rest },
  ref,
) {
  return <Headless.Root ref={ref} className={cn('grx-collapsible', className)} {...rest} />;
});

const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function CollapsibleTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger ref={ref} className={cn('grx-collapsible__trigger', className)} {...rest} />
    );
  },
);

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CollapsibleContent({ className, ...rest }, ref) {
    return (
      <Headless.Content ref={ref} className={cn('grx-collapsible__content', className)} {...rest} />
    );
  },
);

export const Collapsible = { Root, Trigger, Content };
