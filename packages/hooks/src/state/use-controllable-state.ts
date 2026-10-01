import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from "react";
import { useLatestRef } from "../ref/use-latest-ref";

export interface UseControllableStateOptions<T> {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
}

/**
 * Unifies controlled and uncontrolled state — the standard headless pattern
 * found in Radix / Ark / React Aria. If `value` is provided, the hook is in
 * controlled mode and `onChange` is emitted on setter calls (internal state
 * is not updated). If `value` is undefined, internal state is used with
 * `defaultValue` as the seed.
 *
 * The returned setter has a stable identity across renders, making it safe to
 * pass to memoized children or effect dependencies.
 */
export function useControllableState<T>(options: UseControllableStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
    const { value, defaultValue, onChange } = options;
    const isControlled = value !== undefined;

    const [internal, setInternal] = useState<T>(defaultValue as T);
    // Latest internal value — lets the setter compute `next` outside a state
    // updater. Updaters must stay pure: React runs them twice under StrictMode,
    // which would fire `onChange` twice.
    const internalRef = useRef<T>(internal);
    const current = (isControlled ? value : internal) as T;

    const ctxRef = useLatestRef({ isControlled, value, onChange });

    const setter = useCallback<Dispatch<SetStateAction<T>>>(
        (update) => {
            const ctx = ctxRef.current;
            const prev = ctx.isControlled ? (ctx.value as T) : internalRef.current;
            const next = typeof update === "function" ? (update as (p: T) => T)(prev) : update;

            if (!ctx.isControlled) {
                internalRef.current = next;
                setInternal(next);
            }
            ctx.onChange?.(next);
        },
        [ctxRef],
    );

    return [current, setter];
}
