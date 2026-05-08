import {
  Tabs as Headless,
  type TabsContentProps,
  type TabsRootProps,
  type TabsTriggerProps,
} from '@gugbab/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type TabsVariant = 'underline' | 'pills';
export type TabsSize = 'sm' | 'md';

export interface TabsRootStyledProps extends TabsRootProps {
  variant?: TabsVariant;
  size?: TabsSize;
}

const Root = forwardRef<HTMLDivElement, TabsRootStyledProps>(function TabsRoot(
  { variant = 'pills', size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('grx-tabs', `grx-tabs--${variant}`, `grx-tabs--${size}`, className)}
      {...rest}
    />
  );
});

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TabsList(
  { className, ...rest },
  ref,
) {
  return <Headless.List ref={ref} className={cn('grx-tabs__list', className)} {...rest} />;
});

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { className, ...rest },
  ref,
) {
  return <Headless.Trigger ref={ref} className={cn('grx-tabs__trigger', className)} {...rest} />;
});

const Content = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, ...rest },
  ref,
) {
  return <Headless.Content ref={ref} className={cn('grx-tabs__content', className)} {...rest} />;
});

export const Tabs = { Root, List, Trigger, Content };
