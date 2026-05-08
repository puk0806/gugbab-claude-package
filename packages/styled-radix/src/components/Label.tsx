import { Label as HeadlessLabel } from '@gugbab/headless';
import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, ...rest },
  ref,
) {
  return <HeadlessLabel ref={ref} className={cn('grx-label', className)} {...rest} />;
});
