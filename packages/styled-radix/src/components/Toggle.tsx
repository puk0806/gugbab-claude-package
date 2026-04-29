import { Toggle as HeadlessToggle, type ToggleProps } from '@gugbab-ui/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type ToggleSize = 'sm' | 'md';
export type ToggleVariant = 'default' | 'outline';

export interface StyledToggleProps extends ToggleProps {
  size?: ToggleSize;
  variant?: ToggleVariant;
}

export const Toggle = forwardRef<HTMLButtonElement, StyledToggleProps>(function Toggle(
  { size = 'md', variant = 'default', className, ...rest },
  ref,
) {
  return (
    <HeadlessToggle
      ref={ref}
      className={cn('grx-toggle', `grx-toggle--${size}`, `grx-toggle--${variant}`, className)}
      {...rest}
    />
  );
});
