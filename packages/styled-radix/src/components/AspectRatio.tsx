import { type AspectRatioProps, AspectRatio as HeadlessAspectRatio } from '@gugbab/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface StyledAspectRatioProps extends AspectRatioProps {}

export const AspectRatio = forwardRef<HTMLDivElement, StyledAspectRatioProps>(function AspectRatio(
  { className, ...rest },
  ref,
) {
  return <HeadlessAspectRatio ref={ref} className={cn('grx-aspect-ratio', className)} {...rest} />;
});
