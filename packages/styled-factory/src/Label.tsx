import { Label as HeadlessLabel } from "@gugbab/headless";
import { cn } from "@gugbab/utils";
import { forwardRef, type LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function createLabel(prefix: string) {
    const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ className, ...rest }, ref) {
        return <HeadlessLabel ref={ref} className={cn(`${prefix}-label`, className)} {...rest} />;
    });

    return Label;
}
