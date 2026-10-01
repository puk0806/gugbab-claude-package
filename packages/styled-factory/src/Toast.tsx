import {
    Toast as Headless,
    type ToastActionProps,
    type ToastCloseProps,
    type ToastDescriptionProps,
    type ToastProviderProps,
    type ToastRootProps,
    type ToastTitleProps,
    type ToastViewportProps,
} from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef } from "react";

export function createToast(prefix: string) {
    const Provider = function ToastProvider(props: ToastProviderProps) {
        return <Headless.Provider {...props} />;
    };

    const Viewport = forwardRef<HTMLOListElement, ToastViewportProps>(function ToastViewport(
        { className, ...rest },
        ref,
    ) {
        return <Headless.Viewport ref={ref} className={cn(`${prefix}-toast-viewport`, className)} {...rest} />;
    });

    const Root = forwardRef<HTMLLIElement, ToastRootProps>(function ToastRoot({ className, ...rest }, ref) {
        return <Headless.Root ref={ref} className={cn(`${prefix}-toast`, className)} {...rest} />;
    });

    const Title = forwardRef<HTMLDivElement, ToastTitleProps>(function ToastTitle({ className, ...rest }, ref) {
        return <Headless.Title ref={ref} className={cn(`${prefix}-toast__title`, className)} {...rest} />;
    });

    const Description = forwardRef<HTMLDivElement, ToastDescriptionProps>(function ToastDescription(
        { className, ...rest },
        ref,
    ) {
        return <Headless.Description ref={ref} className={cn(`${prefix}-toast__description`, className)} {...rest} />;
    });

    const Action = forwardRef<HTMLButtonElement, ToastActionProps>(function ToastAction({ className, ...rest }, ref) {
        return <Headless.Action ref={ref} className={cn(`${prefix}-toast__action`, className)} {...rest} />;
    });

    const Close = forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose({ className, ...rest }, ref) {
        return <Headless.Close ref={ref} className={cn(`${prefix}-toast__close`, className)} {...rest} />;
    });

    return { Provider, Viewport, Root, Title, Description, Action, Close };
}
