import { describe, expect, it } from "vitest";
import { fitMessagesToBudget } from "./fit-messages-to-budget";

type Msg = { role: "user" | "assistant"; content: string };

const u = (content: string): Msg => ({ role: "user", content });
const a = (content: string): Msg => ({ role: "assistant", content });

describe("fitMessagesToBudget", () => {
    it("returns all messages when within budget", () => {
        const messages = [u("aa"), a("bb"), u("cc")];
        expect(fitMessagesToBudget(messages, 100)).toEqual(messages);
    });

    it("drops the oldest round trip first when over budget", () => {
        // bytes: 4 + 4 + 2 + 2 + 2 = 14 → budget 10 → u1+a1 드롭 → 6
        const messages = [u("aaaa"), a("bbbb"), u("cc"), a("dd"), u("ee")];
        expect(fitMessagesToBudget(messages, 10)).toEqual([u("cc"), a("dd"), u("ee")]);
    });

    it("enforces maxMessages by dropping oldest round trips", () => {
        const messages = [u("a"), a("b"), u("c"), a("d"), u("e")];
        expect(fitMessagesToBudget(messages, 100, 3)).toEqual([u("c"), a("d"), u("e")]);
    });

    it("applies byte budget and maxMessages together", () => {
        // maxMessages 4를 먼저 만족해도 바이트 초과면 계속 드롭
        const messages = [u("aaaa"), a("bbbb"), u("cccc"), a("dd"), u("ee")];
        expect(fitMessagesToBudget(messages, 8, 4)).toEqual([u("cccc"), a("dd"), u("ee")]);
    });

    it("keeps first and last messages as user after dropping", () => {
        const messages = [u("aaaa"), a("bbbb"), u("cc"), a("dd"), u("ee")];
        const result = fitMessagesToBudget(messages, 10);
        expect(result[0]?.role).toBe("user");
        expect(result[result.length - 1]?.role).toBe("user");
    });

    // 경계: 예산 판정은 글자 수가 아니라 UTF-8 바이트 기준이어야 함
    it("judges the budget in UTF-8 bytes, not characters", () => {
        // "가가" = 6바이트 (글자 수로는 2) → 총 8바이트 > 7 → 드롭 발생
        const messages = [u("가가"), a("a"), u("b")];
        expect(fitMessagesToBudget(messages, 7)).toEqual([u("b")]);
    });

    // 비정상: user/assistant 교대가 깨진 입력 — 선두 assistant는 계약 위반이므로 제거
    it("strips leading assistant messages even when within budget", () => {
        const messages = [a("bb"), u("cc"), a("dd"), u("ee")];
        expect(fitMessagesToBudget(messages, 100)).toEqual([u("cc"), a("dd"), u("ee")]);
    });

    it("drops consecutive assistant replies together with their user turn", () => {
        // bytes: 2+2+2+2+2 = 10 → budget 6 → u1과 뒤따르는 a1·a2를 한 단위로 드롭
        const messages = [u("aa"), a("bb"), a("cc"), u("dd"), u("ee")];
        expect(fitMessagesToBudget(messages, 6)).toEqual([u("dd"), u("ee")]);
    });

    // 경계: 빈 배열
    it("returns an empty array for empty input", () => {
        expect(fitMessagesToBudget([], 100)).toEqual([]);
    });

    // 경계: 마지막 user 메시지 혼자 예산 초과 — 드롭으로 해결 불가, 그대로 반환
    // (이 유형은 relay가 violation "message-size" 400으로 응답 — 앱이 입력 축소 안내로 대응)
    it("keeps the last user message even when it alone exceeds the budget", () => {
        const messages = [u("aaaaaaaaaa")];
        expect(fitMessagesToBudget(messages, 3)).toEqual([u("aaaaaaaaaa")]);
    });

    it("still exceeds budget after dropping everything droppable — returns only the last message", () => {
        const messages = [u("aaaa"), a("bbbb"), u("cccccccc")];
        expect(fitMessagesToBudget(messages, 5)).toEqual([u("cccccccc")]);
    });

    // 경계: 예산 0
    it("drops everything droppable when budget is 0", () => {
        const messages = [u("aa"), a("bb"), u("cc")];
        expect(fitMessagesToBudget(messages, 0)).toEqual([u("cc")]);
    });

    // 비정상: 꼬리 assistant — 마지막 메시지도 user여야 하므로 마지막 user 턴까지만 유지
    it("strips trailing assistant messages so the result ends with user", () => {
        const messages = [u("aa"), a("bb"), u("cc"), a("dd")];
        expect(fitMessagesToBudget(messages, 100)).toEqual([u("aa"), a("bb"), u("cc")]);
    });

    it("never drops the last user turn in favor of a trailing assistant under pressure", () => {
        // maxMessages 1 — 꼬리 assistant가 아니라 마지막 user가 살아남아야 함
        const messages = [u("aa"), a("bb"), u("cc"), a("dd")];
        expect(fitMessagesToBudget(messages, 100, 1)).toEqual([u("cc")]);
    });

    it("returns an empty array when the input has no user message at all", () => {
        const messages = [a("bb"), a("dd")];
        expect(fitMessagesToBudget(messages, 100)).toEqual([]);
    });

    // 에러: 잘못된 예산·개수 상한 거부
    it("throws RangeError on negative or non-finite budget", () => {
        expect(() => fitMessagesToBudget([u("a")], -1)).toThrow(RangeError);
        expect(() => fitMessagesToBudget([u("a")], Number.NaN)).toThrow(RangeError);
        expect(() => fitMessagesToBudget([u("a")], Number.POSITIVE_INFINITY)).not.toThrow();
    });

    it("throws RangeError on non-positive or non-integer maxMessages", () => {
        expect(() => fitMessagesToBudget([u("a")], 100, 0)).toThrow(RangeError);
        expect(() => fitMessagesToBudget([u("a")], 100, -2)).toThrow(RangeError);
        expect(() => fitMessagesToBudget([u("a")], 100, 1.5)).toThrow(RangeError);
    });

    it("does not mutate the input and returns a new array", () => {
        const messages = [u("aa"), a("bb"), u("cc")];
        const snapshot = structuredClone(messages);
        const result = fitMessagesToBudget(messages, 100);
        expect(messages).toEqual(snapshot);
        expect(result).not.toBe(messages);
    });
});
