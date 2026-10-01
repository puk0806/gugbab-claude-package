import { Tabs as Headless, type TabsContentProps, type TabsRootProps, type TabsTriggerProps } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef, type HTMLAttributes } from "react";

export type TabsVariant = "underline" | "pills";

export type TabsSize = "sm" | "md";

export interface TabsRootStyledProps extends TabsRootProps {
    variant?: TabsVariant;
    size?: TabsSize;
}

export function createTabs(prefix: string, { defaultVariant }: { defaultVariant: TabsVariant }) {
    const Root = forwardRef<HTMLDivElement, TabsRootStyledProps>(function TabsRoot(
        { variant = defaultVariant, size = "md", className, ...rest },
        ref,
    ) {
        return (
            <Headless.Root
                ref={ref}
                className={cn(`${prefix}-tabs`, `${prefix}-tabs--${variant}`, `${prefix}-tabs--${size}`, className)}
                {...rest}
            />
        );
    });

    const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TabsList(
        { className, ...rest },
        ref,
    ) {
        return <Headless.List ref={ref} className={cn(`${prefix}-tabs__list`, className)} {...rest} />;
    });

    const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger({ className, ...rest }, ref) {
        return <Headless.Trigger ref={ref} className={cn(`${prefix}-tabs__trigger`, className)} {...rest} />;
    });

    const Content = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent({ className, ...rest }, ref) {
        return <Headless.Content ref={ref} className={cn(`${prefix}-tabs__content`, className)} {...rest} />;
    });

    return { Root, List, Trigger, Content };
}
