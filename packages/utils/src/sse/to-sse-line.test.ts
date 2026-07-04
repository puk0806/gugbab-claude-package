import { describe, expect, it } from "vitest";
import { parseSSELine } from "./parse-sse-line";
import { toSSELine } from "./to-sse-line";

describe("toSSELine", () => {
    it("formats a chunk event as SSE data line", () => {
        const result = toSSELine({ type: "chunk", text: "hello" });
        expect(result).toBe('data: {"type":"chunk","text":"hello"}\n\n');
    });

    it("formats a done event", () => {
        expect(toSSELine({ type: "done" })).toBe('data: {"type":"done"}\n\n');
    });

    it("formats an error event", () => {
        expect(toSSELine({ type: "error", message: "oops" })).toBe('data: {"type":"error","message":"oops"}\n\n');
    });

    it("formats a safety_block event", () => {
        const event = {
            type: "safety_block" as const,
            category: "hate",
            message: "blocked",
            resources: [{ url: "https://example.com", title: "Example" }],
        };
        const result = toSSELine(event);
        expect(result).toBe(`data: ${JSON.stringify(event)}\n\n`);
    });

    it("output is parseable by parseSSELine", () => {
        const event = { type: "chunk" as const, text: "round-trip" };
        const line = toSSELine(event).split("\n")[0];
        expect(parseSSELine(line)).toEqual(event);
    });
});
