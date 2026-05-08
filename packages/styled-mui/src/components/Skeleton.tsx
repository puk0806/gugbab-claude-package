import { Skeleton as HeadlessSkeleton, type SkeletonProps } from '@gugbab-ui/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface StyledSkeletonProps extends SkeletonProps {}

export const Skeleton = forwardRef<HTMLDivElement, StyledSkeletonProps>(function Skeleton(
  { className, variant = 'rectangular', ...rest },
  ref,
) {
  return (
    <HeadlessSkeleton
      ref={ref}
      variant={variant}
      className={cn('gmui-skeleton', `gmui-skeleton--${variant}`, className)}
      {...rest}
    />
  );
});
