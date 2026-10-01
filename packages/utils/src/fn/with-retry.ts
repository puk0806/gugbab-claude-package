export interface WithRetryOptions {
    /** Retries after the first attempt. Non-negative integer. Default 3. */
    maxRetries?: number;
    /** First backoff delay in ms (doubles each retry). Default 1000. */
    baseDelay?: number;
    /** Upper bound for a single backoff delay in ms. Default 30000. */
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
    /** Aborts pending waits and further attempts; rejects with `signal.reason`. */
    signal?: AbortSignal;
}

function abortReason(signal: AbortSignal): unknown {
    return signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
}

function wait(ms: number, signal: AbortSignal | undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(abortReason(signal));
            return;
        }
        const onAbort = () => {
            clearTimeout(timer);
            reject(abortReason(signal as AbortSignal));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

export async function withRetry<T>(fn: () => Promise<T>, options: WithRetryOptions = {}): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 30_000, shouldRetry = () => true, signal } = options;

    // Reject bad input up front: Infinity/NaN would retry forever or never wait.
    if (!Number.isInteger(maxRetries) || maxRetries < 0) {
        throw new RangeError(`maxRetries must be a non-negative integer (received ${maxRetries})`);
    }
    for (const [name, value] of [
        ["baseDelay", baseDelay],
        ["maxDelay", maxDelay],
    ] as const) {
        if (!Number.isFinite(value) || value < 0) {
            throw new RangeError(`${name} must be a non-negative finite number (received ${value})`);
        }
    }

    let attempt = 0;
    while (true) {
        if (signal?.aborted) throw abortReason(signal);
        try {
            return await fn();
        } catch (err) {
            if (attempt >= maxRetries) throw err;
            let retry: boolean;
            try {
                retry = shouldRetry(err);
            } catch {
                // A faulty predicate must not mask the error that actually happened.
                throw err;
            }
            if (!retry) throw err;
            await wait(Math.min(baseDelay * 2 ** attempt, maxDelay), signal);
            attempt++;
        }
    }
}
