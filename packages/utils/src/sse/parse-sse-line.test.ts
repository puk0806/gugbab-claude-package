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

    it("parses error event", () => {
        const result = parseSSELine('data: {"type":"error","message":"oops"}');
        expect(result).toEqual({ type: "error", message: "oops" });
    });

    it("trims whitespace around the data value", () => {
        const result = parseSSELine('data:  {"type":"done"} ');
        expect(result).toEqual({ type: "done" });
    });
});
