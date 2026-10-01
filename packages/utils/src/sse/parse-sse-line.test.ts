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

    describe("형식 검증 (악성·비정상 페이로드)", () => {
        it.each([
            ['data: {"type":"chunk"}', "chunk에 text 없음"],
            ['data: {"type":"chunk","text":{"x":1}}', "chunk text가 객체"],
            ['data: {"type":"error"}', "error에 message 없음"],
            ['data: {"type":"done","summary":42}', "done summary가 숫자"],
            ['data: {"type":"safety_block","category":"x","message":"m","resources":"nope"}', "resources가 배열 아님"],
            [
                'data: {"type":"safety_block","category":"x","message":"m","resources":[{"url":1}]}',
                "resource url이 숫자",
            ],
            ['data: {"type":"unknown","text":"t"}', "알 수 없는 type"],
            ["data: [1,2,3]", "배열 페이로드"],
            ['data: "chunk"', "문자열 페이로드"],
            ["data: null", "null 페이로드"],
        ])("%s → null (%s)", (line) => {
            expect(parseSSELine(line)).toBeNull();
        });

        it("__proto__ 키가 있어도 정상 필드만 있으면 통과하고 프로토타입을 오염시키지 않는다", () => {
            const event = parseSSELine('data: {"type":"chunk","text":"hi","__proto__":{"polluted":true}}');
            expect(event).toMatchObject({ type: "chunk", text: "hi" });
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        it("유효한 safety_block은 그대로 반환한다", () => {
            const line =
                'data: {"type":"safety_block","category":"self_harm","message":"m","resources":[{"url":"https://a.example","title":"A"},{}]}';
            expect(parseSSELine(line)).toEqual({
                type: "safety_block",
                category: "self_harm",
                message: "m",
                resources: [{ url: "https://a.example", title: "A" }, {}],
            });
        });
    });

    describe("선택 필드 null·누락 허용 (서버 직렬화 차이 경계)", () => {
        it("done.summary가 null이면 summary 없는 done으로 정규화한다", () => {
            expect(parseSSELine('data: {"type":"done","summary":null}')).toEqual({ type: "done" });
        });

        it.each([
            ['data: {"type":"safety_block","category":"c","message":"m"}', "resources 누락"],
            ['data: {"type":"safety_block","category":"c","message":"m","resources":null}', "resources가 null"],
        ])("%s → resources [] (%s) — 안전 안내가 사라지지 않는다", (line) => {
            expect(parseSSELine(line)).toEqual({ type: "safety_block", category: "c", message: "m", resources: [] });
        });

        it("resource의 url·title이 null이면 해당 필드만 뺀다", () => {
            const line =
                'data: {"type":"safety_block","category":"c","message":"m","resources":[{"url":null,"title":"T"}]}';
            expect(parseSSELine(line)).toEqual({
                type: "safety_block",
                category: "c",
                message: "m",
                resources: [{ title: "T" }],
            });
        });

        it("필수 필드가 null이면 여전히 거부한다", () => {
            expect(parseSSELine('data: {"type":"chunk","text":null}')).toBeNull();
            expect(parseSSELine('data: {"type":"error","message":null}')).toBeNull();
        });
    });
});
