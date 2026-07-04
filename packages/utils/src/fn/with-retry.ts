export interface WithRetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(fn: () => Promise<T>, options: WithRetryOptions = {}): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, shouldRetry = () => true } = options;

    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err) {
            if (attempt >= maxRetries || !shouldRetry(err)) throw err;
            await new Promise((resolve) => setTimeout(resolve, baseDelay * 2 ** attempt));
            attempt++;
        }
    }
}
