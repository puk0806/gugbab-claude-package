import {
  ScrollArea as Headless,
  type ScrollAreaCornerProps,
  type ScrollAreaRootProps,
  type ScrollAreaScrollbarProps,
  type ScrollAreaThumbProps,
  type ScrollAreaViewportProps,
} from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef } from 'react';

const Root = forwardRef<HTMLDivElement, ScrollAreaRootProps>(function ScrollAreaRoot(
  { className, ...rest },
  ref,
) {
  return <Headless.Root ref={ref} className={cn('gmui-scroll-area', className)} {...rest} />;
});

const Viewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(function ScrollAreaViewport(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Viewport
      ref={ref}
      className={cn('gmui-scroll-area__viewport', className)}
      {...rest}
    />
  );
});

const Scrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(function ScrollAreaScrollbar(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Scrollbar
      ref={ref}
      className={cn('gmui-scroll-area__scrollbar', className)}
      {...rest}
    />
  );
});

const Thumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(function ScrollAreaThumb(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Thumb ref={ref} className={cn('gmui-scroll-area__thumb', className)} {...rest} />
  );
});

const Corner = forwardRef<HTMLDivElement, ScrollAreaCornerProps>(function ScrollAreaCorner(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Corner ref={ref} className={cn('gmui-scroll-area__corner', className)} {...rest} />
  );
});

export const ScrollArea = { Root, Viewport, Scrollbar, Thumb, Corner };
