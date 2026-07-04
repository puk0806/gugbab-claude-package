import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withRetry } from "./with-retry";

describe("withRetry", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("returns result immediately when fn succeeds on first call", async () => {
        const fn = vi.fn().mockResolvedValue("ok");
        const promise = withRetry(fn);
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toBe("ok");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and resolves when fn eventually succeeds", async () => {
        const fn = vi.fn().mockRejectedValueOnce(new Error("fail")).mockResolvedValue("ok");

        const promise = withRetry(fn, { baseDelay: 100 });
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toBe("ok");
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("rejects after exhausting all retries", async () => {
        const err = new Error("always fails");
        const fn = vi.fn().mockRejectedValue(err);

        // attach rejection handler before advancing timers to avoid unhandled rejection
        const assertion = expect(withRetry(fn, { maxRetries: 3, baseDelay: 10 })).rejects.toThrow("always fails");
        await vi.runAllTimersAsync();
        await assertion;
        expect(fn).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it("applies exponential backoff between retries", async () => {
        const delays: number[] = [];
        const originalSetTimeout = globalThis.setTimeout;

        const fn = vi
            .fn()
            .mockRejectedValueOnce(new Error())
            .mockRejectedValueOnce(new Error())
            .mockResolvedValue("ok");

        vi.spyOn(globalThis, "setTimeout").mockImplementation((cb, delay, ...args) => {
            delays.push(delay as number);
            return originalSetTimeout(cb, 0, ...args);
        });

        const promise = withRetry(fn, { baseDelay: 100, maxRetries: 3 });
        await vi.runAllTimersAsync();
        await promise;

        expect(delays[0]).toBe(100);
        expect(delays[1]).toBe(200);
    });

    it("stops retrying if shouldRetry returns false", async () => {
        const fn = vi.fn().mockRejectedValue(new Error("permanent"));
        const shouldRetry = (err: unknown) => (err as Error).message !== "permanent";

        const assertion = expect(withRetry(fn, { maxRetries: 3, baseDelay: 10, shouldRetry })).rejects.toThrow(
            "permanent",
        );
        await vi.runAllTimersAsync();
        await assertion;
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
