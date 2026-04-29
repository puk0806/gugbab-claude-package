import { type AspectRatioProps, AspectRatio as HeadlessAspectRatio } from '@gugbab-ui/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface StyledAspectRatioProps extends AspectRatioProps {}

export const AspectRatio = forwardRef<HTMLDivElement, StyledAspectRatioProps>(function AspectRatio(
  { className, ...rest },
  ref,
) {
  return <HeadlessAspectRatio ref={ref} className={cn('gmui-aspect-ratio', className)} {...rest} />;
});
