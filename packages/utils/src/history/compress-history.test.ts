import { describe, expect, it } from "vitest";
import { compressHistory } from "./compress-history";

type Msg = { role: "user" | "assistant"; content: string };

const u = (content: string): Msg => ({ role: "user", content });
const a = (content: string): Msg => ({ role: "assistant", content });

describe("compressHistory", () => {
    it("replaces old assistant content with the summary", () => {
        const messages = [u("q1"), a("long answer one"), u("q2"), a("long answer two"), u("q3")];
        const result = compressHistory(messages, {
            getSummary: () => "s",
            keepRecentTurns: 2,
        });
        expect(result).toEqual([u("q1"), a("s"), u("q2"), a("long answer two"), u("q3")]);
    });

    it("keeps the original content when getSummary returns undefined", () => {
        const messages = [u("q1"), a("answer"), u("q2")];
        const result = compressHistory(messages, {
            getSummary: () => undefined,
            keepRecentTurns: 1,
        });
        expect(result).toEqual(messages);
    });

    it("never summarizes user messages and passes original indices to getSummary", () => {
        const messages = [u("q1"), a("answer one"), a("answer two"), u("q2")];
        const seen: Array<[string, number]> = [];
        compressHistory(messages, {
            getSummary: (msg, index) => {
                seen.push([msg.content, index]);
                return "s";
            },
            keepRecentTurns: 1,
        });
        expect(seen).toEqual([
            ["answer one", 1],
            ["answer two", 2],
        ]);
    });

    it("summarizes every assistant turn when keepRecentTurns is 0", () => {
        const messages = [u("q1"), a("answer one"), u("q2"), a("answer two"), u("q3")];
        const result = compressHistory(messages, {
            getSummary: () => "s",
            keepRecentTurns: 0,
        });
        expect(result).toEqual([u("q1"), a("s"), u("q2"), a("s"), u("q3")]);
    });

    it("keeps everything when keepRecentTurns covers all turns", () => {
        const messages = [u("q1"), a("answer one"), u("q2"), a("answer two"), u("q3")];
        const result = compressHistory(messages, {
            getSummary: () => "s",
            keepRecentTurns: 10,
        });
        expect(result).toEqual(messages);
    });

    // 경계: 빈 배열
    it("returns an empty array for empty input", () => {
        expect(compressHistory([], { getSummary: () => "s", keepRecentTurns: 1 })).toEqual([]);
    });

    // 경계: 요약이 원문보다 길면 교체가 총량을 늘림 — 원문 유지 (UTF-8 바이트 기준)
    it("keeps the original when the summary is not shorter in UTF-8 bytes", () => {
        const messages = [u("q1"), a("ab"), u("q2")];
        const longer = compressHistory(messages, {
            getSummary: () => "much longer summary",
            keepRecentTurns: 0,
        });
        expect(longer).toEqual(messages);

        // 같은 바이트 수여도 교체 이득이 없으므로 원문 유지
        const equal = compressHistory(messages, {
            getSummary: () => "cd",
            keepRecentTurns: 0,
        });
        expect(equal).toEqual(messages);

        // 글자 수는 짧아도 바이트가 크면 원문 유지 ("가가" 6바이트 > "abc" 3바이트)
        const multibyte = compressHistory([u("q1"), a("abc"), u("q2")], {
            getSummary: () => "가가",
            keepRecentTurns: 0,
        });
        expect(multibyte).toEqual([u("q1"), a("abc"), u("q2")]);
    });

    // 비정상: user/assistant 교대가 깨진 입력 — 연속 assistant도 전부 요약 대상
    it("summarizes consecutive assistant messages in the old zone", () => {
        const messages = [a("orphan"), a("orphan two"), u("q1")];
        const result = compressHistory(messages, {
            getSummary: () => "s",
            keepRecentTurns: 1,
        });
        expect(result).toEqual([a("s"), a("s"), u("q1")]);
    });

    // 에러: 잘못된 keepRecentTurns 거부
    it("throws RangeError on negative or non-integer keepRecentTurns", () => {
        const messages = [u("q1")];
        const options = { getSummary: () => "s" };
        expect(() => compressHistory(messages, { ...options, keepRecentTurns: -1 })).toThrow(RangeError);
        expect(() => compressHistory(messages, { ...options, keepRecentTurns: 1.5 })).toThrow(RangeError);
    });

    it("does not mutate the input messages", () => {
        const messages = [u("q1"), a("long answer"), u("q2")];
        const snapshot = structuredClone(messages);
        const result = compressHistory(messages, { getSummary: () => "s", keepRecentTurns: 0 });
        expect(messages).toEqual(snapshot);
        expect(result).not.toBe(messages);
        expect(result[1]).not.toBe(messages[1]);
    });
});
