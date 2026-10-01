import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode, StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "./use-controllable-state";

const strict = ({ children }: { children: ReactNode }) => createElement(StrictMode, null, children);

describe("useControllableState", () => {
    describe("uncontrolled mode (no `value` prop)", () => {
        it("falls back to `defaultValue` for the initial state", () => {
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 7 }));
            expect(result.current[0]).toBe(7);
        });

        it("updates the internal state when the setter is called", () => {
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0 }));

            act(() => {
                result.current[1](5);
            });
            expect(result.current[0]).toBe(5);
        });

        it("calls onChange with the new value on setter invocation", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }));

            act(() => {
                result.current[1](3);
            });

            expect(onChange).toHaveBeenCalledWith(3);
        });

        it("supports functional updates (prev => next)", () => {
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1 }));

            act(() => {
                result.current[1]((prev) => prev + 10);
            });
            expect(result.current[0]).toBe(11);
        });
    });

    describe("controlled mode (`value` prop provided)", () => {
        it("always returns the controlled value", () => {
            const { result } = renderHook(({ value }) => useControllableState<number>({ value, defaultValue: 0 }), {
                initialProps: { value: 42 },
            });

            expect(result.current[0]).toBe(42);
        });

        it("reflects external value changes across rerenders", () => {
            const { result, rerender } = renderHook(
                ({ value }) => useControllableState<number>({ value, defaultValue: 0 }),
                { initialProps: { value: 1 } },
            );

            rerender({ value: 2 });
            expect(result.current[0]).toBe(2);

            rerender({ value: 3 });
            expect(result.current[0]).toBe(3);
        });

        it("does not mutate state internally; only emits onChange", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ value: 10, onChange }));

            act(() => {
                result.current[1](99);
            });

            expect(onChange).toHaveBeenCalledWith(99);
            expect(result.current[0]).toBe(10);
        });

        it("resolves functional updates against the controlled value", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ value: 5, onChange }));

            act(() => {
                result.current[1]((prev) => prev * 2);
            });

            expect(onChange).toHaveBeenCalledWith(10);
        });
    });

    it("exposes a stable setter identity across renders", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useControllableState<number>({ value, defaultValue: 0 }),
            { initialProps: { value: 1 } },
        );

        const firstSetter = result.current[1];
        rerender({ value: 2 });
        expect(result.current[1]).toBe(firstSetter);
    });

    describe("StrictMode / 연쇄 갱신 (경계)", () => {
        it("비제어 모드에서 StrictMode여도 onChange는 setter 1회당 정확히 1번", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }), {
                wrapper: strict,
            });

            act(() => {
                result.current[1](1);
            });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith(1);
            expect(result.current[0]).toBe(1);
        });

        it("StrictMode에서 함수형 갱신도 onChange 1번", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 5, onChange }), {
                wrapper: strict,
            });

            act(() => {
                result.current[1]((p) => p * 2);
            });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith(10);
            expect(result.current[0]).toBe(10);
        });

        it("같은 act 안의 연속 함수형 갱신은 이전 결과를 이어받는다", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }));

            act(() => {
                result.current[1]((p) => p + 1);
                result.current[1]((p) => p + 1);
            });

            expect(result.current[0]).toBe(2);
            expect(onChange.mock.calls).toEqual([[1], [2]]);
        });

        it("제어 모드 StrictMode에서도 onChange 1번, 내부 상태는 변하지 않는다", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useControllableState<number>({ value: 3, onChange }), {
                wrapper: strict,
            });

            act(() => {
                result.current[1]((p) => p + 1);
            });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith(4);
            expect(result.current[0]).toBe(3);
        });

        it("onChange 없이 StrictMode에서 연속 갱신해도 오류 없이 누적된다 (누락 콜백 경계)", () => {
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0 }), {
                wrapper: strict,
            });

            act(() => {
                result.current[1]((p) => p + 1);
                result.current[1]((p) => p + 1);
                result.current[1]((p) => p + 1);
            });

            expect(result.current[0]).toBe(3);
        });

        it("onChange가 throw하면 예외는 setter 호출자에게 전파되고 상태는 갱신된다 (에러 경로)", () => {
            const onChange = vi.fn(() => {
                throw new Error("boom");
            });
            const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }));

            act(() => {
                expect(() => result.current[1](7)).toThrow("boom");
            });

            expect(result.current[0]).toBe(7);
        });
    });
});
