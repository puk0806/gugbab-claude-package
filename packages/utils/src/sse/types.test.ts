import { describe, expect, expectTypeOf, it } from "vitest";
import type { SseCoreEvent, SseEvent, SseSafetyBlockEvent } from "./types";

describe("SseEvent", () => {
    it("done variant accepts an optional summary field", () => {
        const withSummary: SseEvent = { type: "done", summary: "대화 요약" };
        expect(withSummary).toEqual({ type: "done", summary: "대화 요약" });
        expectTypeOf<{ type: "done"; summary?: string }>().toMatchTypeOf<SseEvent>();
    });

    it("done variant without summary remains valid (backward compat)", () => {
        const legacy: SseEvent = { type: "done" };
        expect(legacy).toEqual({ type: "done" });
    });

    it("summary is narrowed to string | undefined on the done variant", () => {
        const event: SseEvent = { type: "done", summary: "요약" };
        if (event.type === "done") {
            expectTypeOf(event.summary).toEqualTypeOf<string | undefined>();
        }
    });

    describe("확장 지점 (relay 전용 이벤트 분리)", () => {
        it("SseCoreEvent는 프로토콜 공통 3종만 포함한다", () => {
            expectTypeOf<SseCoreEvent["type"]>().toEqualTypeOf<"chunk" | "done" | "error">();
        });

        it("기본 SseEvent는 하위 호환을 위해 safety_block을 계속 포함한다", () => {
            expectTypeOf<SseSafetyBlockEvent>().toMatchTypeOf<SseEvent>();
            const block: SseEvent = { type: "safety_block", category: "c", message: "m", resources: [] };
            expect(block.type).toBe("safety_block");
        });

        it("SseEvent<never>는 공통 이벤트만 허용한다 (앱별 이벤트 제외)", () => {
            expectTypeOf<SseEvent<never>>().toEqualTypeOf<SseCoreEvent>();
            expectTypeOf<Extract<SseEvent<never>, { type: "safety_block" }>>().toBeNever();
        });

        it("앱별 이벤트를 제네릭으로 추가할 수 있다", () => {
            type ToolCall = { type: "tool_call"; name: string };
            const call: SseEvent<ToolCall> = { type: "tool_call", name: "search" };
            expect(call.type).toBe("tool_call");
            expectTypeOf<ToolCall>().toMatchTypeOf<SseEvent<ToolCall>>();
            expectTypeOf<Extract<SseEvent<ToolCall>, { type: "safety_block" }>>().toBeNever();
        });

        it("type 필드가 없는 확장 타입은 거부한다 (잘못된 확장)", () => {
            // @ts-expect-error — 확장 이벤트는 문자열 type 판별자를 가져야 한다
            type Invalid = SseEvent<{ name: string }>;
            expectTypeOf<Invalid>().not.toBeNever();
        });
    });
});
