import { forwardRef, type HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 시각적 형태.
   * - `rectangular` (기본): 사각 placeholder
   * - `circular`: 원형 (avatar 등)
   * - `text`: 한 줄 텍스트 폭 placeholder
   */
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'rectangular', ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-busy="true"
      aria-live="polite"
      data-variant={variant}
      {...rest}
    />
  );
});
Skeleton.displayName = 'Skeleton';
