import { type CollapsibleRootProps, Collapsible as Headless } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { type ButtonHTMLAttributes, forwardRef, type HTMLAttributes } from "react";

export function createCollapsible(prefix: string) {
    const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>(function CollapsibleRoot(
        { className, ...rest },
        ref,
    ) {
        return <Headless.Root ref={ref} className={cn(`${prefix}-collapsible`, className)} {...rest} />;
    });

    const Trigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function CollapsibleTrigger(
        { className, ...rest },
        ref,
    ) {
        return <Headless.Trigger ref={ref} className={cn(`${prefix}-collapsible__trigger`, className)} {...rest} />;
    });

    const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CollapsibleContent(
        { className, ...rest },
        ref,
    ) {
        return <Headless.Content ref={ref} className={cn(`${prefix}-collapsible__content`, className)} {...rest} />;
    });

    return { Root, Trigger, Content };
}
