import {
    OneTimePasswordField as Headless,
    type OTPFieldHiddenInputProps,
    type OTPFieldInputProps,
    type OTPFieldRootProps,
} from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef } from "react";

export function createOneTimePasswordField(prefix: string) {
    const Root = forwardRef<HTMLDivElement, OTPFieldRootProps>(function OTPFieldRoot({ className, ...rest }, ref) {
        return <Headless.Root ref={ref} className={cn(`${prefix}-otp`, className)} {...rest} />;
    });

    const Input = forwardRef<HTMLInputElement, OTPFieldInputProps>(function OTPFieldInput({ className, ...rest }, ref) {
        return <Headless.Input ref={ref} className={cn(`${prefix}-otp__input`, className)} {...rest} />;
    });

    const HiddenInput = forwardRef<HTMLInputElement, OTPFieldHiddenInputProps>(
        function OTPFieldHiddenInput(props, ref) {
            return <Headless.HiddenInput ref={ref} {...props} />;
        },
    );

    return { Root, Input, HiddenInput };
}
