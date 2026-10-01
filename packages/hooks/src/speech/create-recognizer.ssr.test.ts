// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createRecognizer } from "./create-recognizer";

// SSR (Next.js 서버 렌더 등): window 가 없다. 계약상 "미지원 환경에서 throw" — 그 에러여야지
// ReferenceError 로 터지면 호출부의 "not supported" 분기가 동작하지 않는다.
describe("createRecognizer — window 가 없는 환경 (SSR 경계)", () => {
    it("ReferenceError 가 아니라 미지원 에러로 거부한다", () => {
        expect(typeof globalThis.window).toBe("undefined");
        expect(() => createRecognizer({ lang: "ko-KR", onResult: () => {} })).toThrow(
            "SpeechRecognition is not supported in this environment",
        );
    });

    it("던지는 에러는 ReferenceError 가 아니다 (오류 유형 계약)", () => {
        let caught: unknown;
        try {
            createRecognizer({ lang: "en-US", onResult: () => {} });
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(Error);
        expect(caught).not.toBeInstanceOf(ReferenceError);
    });
});
