import {
    type FormControlProps,
    type FormFieldProps,
    type FormLabelProps,
    type FormMessageProps,
    type FormRootProps,
    type FormSubmitProps,
    Form as Headless,
} from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef } from "react";

export type FormFieldStatus = "default" | "success" | "warning" | "error" | "serverInvalid";

export interface FormStyledFieldProps extends FormFieldProps {
    status?: FormFieldStatus;
}

export function createForm(prefix: string) {
    const Root = forwardRef<HTMLFormElement, FormRootProps>(function FormRoot({ className, ...rest }, ref) {
        return <Headless.Root ref={ref} className={cn(`${prefix}-form`, className)} {...rest} />;
    });

    const Field = forwardRef<HTMLDivElement, FormStyledFieldProps>(function FormField(
        { status = "default", className, ...rest },
        ref,
    ) {
        return (
            <Headless.Field
                ref={ref}
                className={cn(
                    `${prefix}-form__field`,
                    status !== "default" && `${prefix}-form__field--${status}`,
                    className,
                )}
                {...rest}
            />
        );
    });

    const Label = forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel({ className, ...rest }, ref) {
        return <Headless.Label ref={ref} className={cn(`${prefix}-form__label`, className)} {...rest} />;
    });

    const Control = forwardRef<HTMLInputElement, FormControlProps>(function FormControl({ className, ...rest }, ref) {
        return <Headless.Control ref={ref} className={cn(`${prefix}-form__control`, className)} {...rest} />;
    });

    const Message = forwardRef<HTMLSpanElement, FormMessageProps>(function FormMessage({ className, ...rest }, ref) {
        return <Headless.Message ref={ref} className={cn(`${prefix}-form__message`, className)} {...rest} />;
    });

    const Submit = forwardRef<HTMLButtonElement, FormSubmitProps>(function FormSubmit({ className, ...rest }, ref) {
        return <Headless.Submit ref={ref} className={cn(`${prefix}-form__submit`, className)} {...rest} />;
    });

    return { Root, Field, Label, Control, Message, Submit };
}
