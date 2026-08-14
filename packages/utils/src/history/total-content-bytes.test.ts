// adversarial-test-guard: allow — 타입 안전한 순수 합산 함수로 예외를 던지는 에러 경로가
// 설계상 존재하지 않음 (relay와 동일하게 TextEncoder 기준으로 항상 값을 반환해야 함).
// 대신 경계·비정상 입력(빈 배열·빈 문자열·멀티바이트·깨진 서로게이트)을 집중 커버.
import { describe, expect, it } from "vitest";
import { totalContentBytes } from "./total-content-bytes";

describe("totalContentBytes", () => {
    it("sums UTF-8 bytes of ASCII contents", () => {
        expect(totalContentBytes([{ content: "abc" }, { content: "de" }])).toBe(5);
    });

    it("returns 0 for empty array", () => {
        expect(totalContentBytes([])).toBe(0);
    });

    it("returns 0 for empty contents", () => {
        expect(totalContentBytes([{ content: "" }, { content: "" }])).toBe(0);
    });

    // 경계: 한글은 UTF-8에서 3바이트 — 글자 수 기준과 어긋나는 지점
    it("counts Korean characters as 3 bytes each", () => {
        expect(totalContentBytes([{ content: "가나다" }])).toBe(9);
    });

    // 경계: 이모지는 4바이트 (서로게이트 페어 — string.length로는 2)
    it("counts emoji as 4 bytes each", () => {
        expect(totalContentBytes([{ content: "😀" }])).toBe(4);
    });

    it("sums mixed ASCII, Korean, and emoji correctly", () => {
        // "a" 1 + "가" 3 + "😀" 4 = 8
        expect(totalContentBytes([{ content: "a가" }, { content: "😀" }])).toBe(8);
    });

    // 비정상: 짝 잃은 서로게이트 — TextEncoder는 U+FFFD(3바이트)로 대체하며 깨지지 않아야 함
    it("does not crash on a lone surrogate and counts it as replacement char bytes", () => {
        expect(totalContentBytes([{ content: "\ud800" }])).toBe(3);
    });

    it("does not mutate the input array", () => {
        const messages = [{ content: "가" }];
        totalContentBytes(messages);
        expect(messages).toEqual([{ content: "가" }]);
    });
});
