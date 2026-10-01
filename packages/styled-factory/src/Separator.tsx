import { Separator as HeadlessSeparator, type SeparatorProps } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef } from "react";

export interface StyledSeparatorProps extends SeparatorProps {}

export function createSeparator(prefix: string) {
    const Separator = forwardRef<HTMLDivElement, StyledSeparatorProps>(function Separator(
        { className, orientation = "horizontal", ...rest },
        ref,
    ) {
        return (
            <HeadlessSeparator
                ref={ref}
                orientation={orientation}
                className={cn(`${prefix}-separator`, `${prefix}-separator--${orientation}`, className)}
                {...rest}
            />
        );
    });

    return Separator;
}
