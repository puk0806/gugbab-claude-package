import { type AspectRatioProps, AspectRatio as HeadlessAspectRatio } from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef } from 'react';

export interface StyledAspectRatioProps extends AspectRatioProps {}

export const AspectRatio = forwardRef<HTMLDivElement, StyledAspectRatioProps>(function AspectRatio(
  { className, ...rest },
  ref,
) {
  return <HeadlessAspectRatio ref={ref} className={cn('gmui-aspect-ratio', className)} {...rest} />;
});
