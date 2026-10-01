import { type AspectRatioProps, AspectRatio as HeadlessAspectRatio } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef } from "react";

export interface StyledAspectRatioProps extends AspectRatioProps {}

export function createAspectRatio(prefix: string) {
    const AspectRatio = forwardRef<HTMLDivElement, StyledAspectRatioProps>(function AspectRatio(
        { className, ...rest },
        ref,
    ) {
        return <HeadlessAspectRatio ref={ref} className={cn(`${prefix}-aspect-ratio`, className)} {...rest} />;
    });

    return AspectRatio;
}
