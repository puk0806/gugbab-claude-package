import { Label as HeadlessLabel } from '@gugbab/headless';
import { cn } from '@gugbab/utils';
import { forwardRef, type LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, ...rest },
  ref,
) {
  return <HeadlessLabel ref={ref} className={cn('grx-label', className)} {...rest} />;
});
