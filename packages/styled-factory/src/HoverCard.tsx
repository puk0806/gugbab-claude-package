import { HoverCard as Headless, type HoverCardRootProps } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

export type { HoverCardRootProps };

export function createHoverCard(prefix: string) {
    const Trigger = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<typeof Headless.Trigger>>(
        function HoverCardTrigger({ className, ...rest }, ref) {
            return <Headless.Trigger ref={ref} className={cn(`${prefix}-hover-card__trigger`, className)} {...rest} />;
        },
    );

    const Content = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Headless.Content>>(
        function HoverCardContent({ className, ...rest }, ref) {
            return <Headless.Content ref={ref} className={cn(`${prefix}-hover-card__content`, className)} {...rest} />;
        },
    );

    return {
        Root: Headless.Root,
        Trigger,
        Portal: Headless.Portal,
        Content,
    };
}
