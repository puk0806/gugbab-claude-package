import {
  OneTimePasswordField as Headless,
  type OTPFieldHiddenInputProps,
  type OTPFieldInputProps,
  type OTPFieldRootProps,
} from '@gugbab/headless';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

const Root = forwardRef<HTMLDivElement, OTPFieldRootProps>(function OTPFieldRoot(
  { className, ...rest },
  ref,
) {
  return <Headless.Root ref={ref} className={cn('grx-otp', className)} {...rest} />;
});

const Input = forwardRef<HTMLInputElement, OTPFieldInputProps>(function OTPFieldInput(
  { className, ...rest },
  ref,
) {
  return <Headless.Input ref={ref} className={cn('grx-otp__input', className)} {...rest} />;
});

const HiddenInput = forwardRef<HTMLInputElement, OTPFieldHiddenInputProps>(
  function OTPFieldHiddenInput(props, ref) {
    return <Headless.HiddenInput ref={ref} {...props} />;
  },
);

export const OneTimePasswordField = { Root, Input, HiddenInput };
