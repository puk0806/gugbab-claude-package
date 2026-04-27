import { useControllableState } from '@gugbab-ui/hooks';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from '../../primitives/Slot/Slot';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  asChild?: boolean;
}

/**
 * Two-state button. `aria-pressed` reflects the toggle state.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed,
    defaultPressed,
    onPressedChange,
    onClick,
    type = 'button',
    disabled,
    asChild,
    ...rest
  },
  ref,
) {
  const [isPressed, setPressed] = useControllableState<boolean>({
    value: pressed,
    defaultValue: defaultPressed ?? false,
    onChange: onPressedChange,
  });
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) setPressed(!isPressed);
      }}
      {...rest}
    />
  );
});
