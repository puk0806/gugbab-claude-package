import {
  type AvatarFallbackProps,
  type AvatarImageProps,
  Avatar as Headless,
} from '@gugbab/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarRootProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
}

const Root = forwardRef<HTMLSpanElement, AvatarRootProps>(function AvatarRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('grx-avatar', `grx-avatar--${size}`, className)}
      {...rest}
    />
  );
});

const Image = forwardRef<HTMLImageElement, AvatarImageProps>(function AvatarImage(
  { className, ...rest },
  ref,
) {
  return <Headless.Image ref={ref} className={cn('grx-avatar__image', className)} {...rest} />;
});

const Fallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(function AvatarFallback(
  { className, ...rest },
  ref,
) {
  return (
    <Headless.Fallback ref={ref} className={cn('grx-avatar__fallback', className)} {...rest} />
  );
});

export const Avatar = { Root, Image, Fallback };
