import {
  type AccordionItemProps,
  type AccordionRootProps,
  Accordion as Headless,
} from '@gugbab-ui/headless';
import { type ButtonHTMLAttributes, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type AccordionVariant = 'default' | 'outline';

export type AccordionRootStyledProps = AccordionRootProps & {
  variant?: AccordionVariant;
  className?: string;
};

const Root = forwardRef<HTMLDivElement, AccordionRootStyledProps>(
  function AccordionRoot(props, ref) {
    const { variant = 'default', className, ...rest } = props;
    return (
      <Headless.Root
        ref={ref}
        className={cn('gmui-accordion', `gmui-accordion--${variant}`, className)}
        {...(rest as AccordionRootProps)}
      />
    );
  },
);

const Item = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, ...rest },
  ref,
) {
  return <Headless.Item ref={ref} className={cn('gmui-accordion__item', className)} {...rest} />;
});

const Header = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function AccordionHeader({ className, ...rest }, ref) {
    return (
      <Headless.Header ref={ref} className={cn('gmui-accordion__header', className)} {...rest} />
    );
  },
);

const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function AccordionTrigger({ className, ...rest }, ref) {
    return (
      <Headless.Trigger ref={ref} className={cn('gmui-accordion__trigger', className)} {...rest} />
    );
  },
);

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AccordionContent({ className, ...rest }, ref) {
    return (
      <Headless.Content ref={ref} className={cn('gmui-accordion__content', className)} {...rest} />
    );
  },
);

export const Accordion = { Root, Item, Header, Trigger, Content };
