import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withRetry } from "./with-retry";

describe("withRetry — 비정상 옵션·남용 방어", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it.each([
        Number.NaN,
        -1,
        1.5,
        Number.POSITIVE_INFINITY,
    ])("maxRetries=%s 는 fn 호출 전에 RangeError", async (maxRetries) => {
        const fn = vi.fn().mockResolvedValue("ok");
        await expect(withRetry(fn, { maxRetries })).rejects.toThrow(RangeError);
        expect(fn).not.toHaveBeenCalled();
    });

    it.each([Number.NaN, -1, Number.POSITIVE_INFINITY])("baseDelay=%s 는 RangeError", async (baseDelay) => {
        await expect(withRetry(vi.fn(), { baseDelay })).rejects.toThrow(RangeError);
    });

    it("지연은 maxDelay 로 상한된다 (무한 증가 방지)", async () => {
        const delays: number[] = [];
        const real = globalThis.setTimeout;
        vi.spyOn(globalThis, "setTimeout").mockImplementation((cb, delay, ...args) => {
            delays.push(delay as number);
            return real(cb, 0, ...args);
        });
        const fn = vi.fn().mockRejectedValue(new Error("x"));
        const assertion = expect(withRetry(fn, { maxRetries: 4, baseDelay: 1000, maxDelay: 2500 })).rejects.toThrow(
            "x",
        );
        await vi.runAllTimersAsync();
        await assertion;
        expect(delays).toEqual([1000, 2000, 2500, 2500]);
    });

    it("기본 maxDelay(30초)가 적용된다 (매우 큰 시도 수에서도 대기 상한)", async () => {
        const delays: number[] = [];
        const real = globalThis.setTimeout;
        vi.spyOn(globalThis, "setTimeout").mockImplementation((cb, delay, ...args) => {
            delays.push(delay as number);
            return real(cb, 0, ...args);
        });
        const fn = vi.fn().mockRejectedValue(new Error("x"));
        const assertion = expect(withRetry(fn, { maxRetries: 40, baseDelay: 1000 })).rejects.toThrow("x");
        await vi.runAllTimersAsync();
        await assertion;
        expect(Math.max(...delays)).toBe(30_000);
    });

    it("shouldRetry 가 throw 해도 원래 오류로 reject 한다 (원인 은폐 금지)", async () => {
        const original = new Error("original");
        const fn = vi.fn().mockRejectedValue(original);
        await expect(
            withRetry(fn, {
                shouldRetry: () => {
                    throw new Error("predicate bug");
                },
            }),
        ).rejects.toBe(original);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("이미 중단된 signal 이면 fn 을 호출하지 않고 reject", async () => {
        const controller = new AbortController();
        controller.abort(new Error("cancelled"));
        const fn = vi.fn().mockResolvedValue("ok");
        await expect(withRetry(fn, { signal: controller.signal })).rejects.toThrow("cancelled");
        expect(fn).not.toHaveBeenCalled();
    });

    it("대기 중 중단되면 즉시 reject 하고 다시 시도하지 않는다", async () => {
        const controller = new AbortController();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const promise = withRetry(fn, { baseDelay: 10_000, signal: controller.signal });
        const assertion = expect(promise).rejects.toThrow("stop");
        await vi.advanceTimersByTimeAsync(100);
        controller.abort(new Error("stop"));
        await assertion;
        await vi.runAllTimersAsync();
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
