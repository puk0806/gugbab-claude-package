import { Switch as Headless, type SwitchRootProps } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef, type HTMLAttributes } from "react";

export type SwitchSize = "sm" | "md" | "lg";

export interface StyledSwitchRootProps extends SwitchRootProps {
    size?: SwitchSize;
}

export function createSwitch(prefix: string) {
    const Root = forwardRef<HTMLButtonElement, StyledSwitchRootProps>(function SwitchRoot(
        { size = "md", className, ...rest },
        ref,
    ) {
        return (
            <Headless.Root
                ref={ref}
                className={cn(`${prefix}-switch`, `${prefix}-switch--${size}`, className)}
                {...rest}
            />
        );
    });

    const Thumb = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SwitchThumb(
        { className, ...rest },
        ref,
    ) {
        return <Headless.Thumb ref={ref} className={cn(`${prefix}-switch__thumb`, className)} {...rest} />;
    });

    return { Root, Thumb };
}
