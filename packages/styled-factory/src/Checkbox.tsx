import { type CheckboxRootProps, type CheckedState, Checkbox as Headless } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef, type HTMLAttributes } from "react";

export type CheckboxSize = "sm" | "md" | "lg";

export interface StyledCheckboxRootProps extends CheckboxRootProps {
    size?: CheckboxSize;
}

export type { CheckedState };

export function createCheckbox(prefix: string) {
    const Root = forwardRef<HTMLButtonElement, StyledCheckboxRootProps>(function CheckboxRoot(
        { size = "md", className, ...rest },
        ref,
    ) {
        return (
            <Headless.Root
                ref={ref}
                className={cn(`${prefix}-checkbox`, `${prefix}-checkbox--${size}`, className)}
                {...rest}
            />
        );
    });

    const Indicator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }>(
        function CheckboxIndicator({ className, ...rest }, ref) {
            return (
                <Headless.Indicator ref={ref} className={cn(`${prefix}-checkbox__indicator`, className)} {...rest} />
            );
        },
    );

    return { Root, Indicator };
}
