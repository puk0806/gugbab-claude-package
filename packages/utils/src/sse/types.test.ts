import { describe, expect, expectTypeOf, it } from "vitest";
import type { SseEvent } from "./types";

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
});
