import { Tooltip as Headless, type TooltipRootProps } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

export type { TooltipRootProps };

export function createTooltip(prefix: string) {
    const Trigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Headless.Trigger>>(
        function TooltipTrigger({ className, ...rest }, ref) {
            return <Headless.Trigger ref={ref} className={cn(`${prefix}-tooltip__trigger`, className)} {...rest} />;
        },
    );

    const Content = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Headless.Content>>(
        function TooltipContent({ className, ...rest }, ref) {
            return <Headless.Content ref={ref} className={cn(`${prefix}-tooltip__content`, className)} {...rest} />;
        },
    );

    return {
        Provider: Headless.Provider,
        Root: Headless.Root,
        Trigger,
        Portal: Headless.Portal,
        Content,
    };
}
