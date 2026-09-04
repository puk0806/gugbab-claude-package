import { describe, expect, it } from "vitest";
import { appendTranscript } from "./append-transcript";

describe("appendTranscript", () => {
    // ── 정상 (happy path) ──

    it("prev가 비어 있으면 transcript만 반환한다", () => {
        expect(appendTranscript("", "닭가슴살 먹었어")).toBe("닭가슴살 먹었어");
    });

    it("prev가 있으면 공백 한 칸으로 이어붙인다", () => {
        expect(appendTranscript("오늘", "닭가슴살 먹었어")).toBe("오늘 닭가슴살 먹었어");
    });

    it("max 이하이면 그대로 반환한다", () => {
        expect(appendTranscript("ab", "cd", 5)).toBe("ab cd");
    });

    it("max와 정확히 같으면 자르지 않는다", () => {
        expect(appendTranscript("ab", "cd", 5)).toHaveLength(5);
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("max가 없으면 길이 제한을 적용하지 않는다", () => {
        const long = "가".repeat(10_000);
        expect(appendTranscript("", long)).toBe(long);
    });

    it("max를 넘으면 max 길이로 절단한다", () => {
        expect(appendTranscript("abcde", "fghij", 7)).toBe("abcde f");
    });

    it("transcript가 비어 있으면 prev를 그대로 반환한다 (꼬리 공백 없음)", () => {
        expect(appendTranscript("오늘", "")).toBe("오늘");
    });

    it("절단 지점이 서로게이트 쌍 중간이면 한 코드유닛 더 제거한다", () => {
        // "😀"는 2 code units — max=1이면 high surrogate만 남으므로 제거
        expect(appendTranscript("", "😀", 1)).toBe("");
    });

    it("서로게이트 쌍 경계에서 정확히 끝나면 이모지를 보존한다", () => {
        expect(appendTranscript("", "😀😀", 2)).toBe("😀");
    });

    it("이모지 혼합 문장 절단 시 깨진 문자를 남기지 않는다", () => {
        const result = appendTranscript("hi", "a😀b", 5); // "hi a😀b" → cut at 5 = "hi a" + high surrogate
        expect(result).toBe("hi a");
        // 결과에 미완성 서로게이트가 없어야 한다
        const last = result.charCodeAt(result.length - 1);
        expect(last >= 0xd800 && last <= 0xdbff).toBe(false);
    });

    // ── 악성·오남용 (adversarial) ──

    it("max가 0이면 빈 문자열을 반환한다 (음수 slice 오동작 방지)", () => {
        expect(appendTranscript("abc", "def", 0)).toBe("");
    });

    it("max가 음수여도 빈 문자열을 반환한다", () => {
        expect(appendTranscript("abc", "def", -5)).toBe("");
    });

    it("초장문 입력도 max로 안전하게 절단한다", () => {
        const bomb = "😀".repeat(50_000);
        const result = appendTranscript("", bomb, 101); // 홀수 → 서로게이트 중간 절단
        expect(result).toHaveLength(100);
    });

    it("제어 문자(NUL 포함)·개행이 섞여도 길이 계약을 지킨다", () => {
        // NUL은 이스케이프 형태로만 사용 — 소스 파일에 리터럴 제어 바이트를 넣지 않는다
        const result = appendTranscript("a\n\tb", " c\u0000d", 6);
        expect(result.length).toBeLessThanOrEqual(6);
    });
});
