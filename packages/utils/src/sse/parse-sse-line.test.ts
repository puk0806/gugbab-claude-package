import { describe, expect, it } from "vitest";
import { parseSSELine } from "./parse-sse-line";

describe("parseSSELine", () => {
    it("parses a data line with JSON payload", () => {
        const result = parseSSELine('data: {"type":"chunk","text":"hello"}');
        expect(result).toEqual({ type: "chunk", text: "hello" });
    });

    it("returns null for comment lines", () => {
        expect(parseSSELine(": ping")).toBeNull();
    });

    it("returns null for empty lines", () => {
        expect(parseSSELine("")).toBeNull();
    });

    it("returns null for non-data lines (event:, id:, retry:)", () => {
        expect(parseSSELine("event: message")).toBeNull();
        expect(parseSSELine("id: 42")).toBeNull();
        expect(parseSSELine("retry: 3000")).toBeNull();
    });

    it("returns null when data is not valid JSON", () => {
        expect(parseSSELine("data: not-json")).toBeNull();
    });

    it("parses done event", () => {
        const result = parseSSELine('data: {"type":"done"}');
        expect(result).toEqual({ type: "done" });
    });

    it("parses done event with optional summary", () => {
        const result = parseSSELine('data: {"type":"done","summary":"대화 요약"}');
        expect(result).toEqual({ type: "done", summary: "대화 요약" });
        if (result?.type === "done") {
            const summary: string | undefined = result.summary;
            expect(summary).toBe("대화 요약");
        }
    });

    it("parses done event without summary as undefined summary", () => {
        const result = parseSSELine('data: {"type":"done"}');
        if (result?.type === "done") {
            expect(result.summary).toBeUndefined();
        } else {
            expect.unreachable("expected a done event");
        }
    });

    it("parses error event", () => {
        const result = parseSSELine('data: {"type":"error","message":"oops"}');
        expect(result).toEqual({ type: "error", message: "oops" });
    });

    it("trims whitespace around the data value", () => {
        const result = parseSSELine('data:  {"type":"done"} ');
        expect(result).toEqual({ type: "done" });
    });
});
