import { afterEach, describe, expect, it } from "vitest";
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported } from "./support";

describe("isSpeechRecognitionSupported", () => {
    afterEach(() => {
        Reflect.deleteProperty(window, "SpeechRecognition");
        Reflect.deleteProperty(window, "webkitSpeechRecognition");
    });

    // ── 정상 ──

    it("SpeechRecognition이 있으면 true", () => {
        Reflect.set(window, "SpeechRecognition", class {});
        expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it("webkitSpeechRecognition만 있어도 true (Safari/Chrome 구버전)", () => {
        Reflect.set(window, "webkitSpeechRecognition", class {});
        expect(isSpeechRecognitionSupported()).toBe(true);
    });

    // ── 경계·이상 경로 ──

    it("둘 다 없으면 예외 없이 false로 판정한다 (미지원 환경 방어)", () => {
        expect(isSpeechRecognitionSupported()).toBe(false);
    });

    it("SpeechRecognition이 null인 스텁이면 false (부분 구현 WebView 방어)", () => {
        Reflect.set(window, "SpeechRecognition", null);
        expect(isSpeechRecognitionSupported()).toBe(false);
    });

    it("생성자가 아닌 위조 구현({})이면 false", () => {
        Reflect.set(window, "SpeechRecognition", {});
        expect(isSpeechRecognitionSupported()).toBe(false);
    });

    it("SpeechRecognition이 null이어도 webkit 생성자가 있으면 true", () => {
        Reflect.set(window, "SpeechRecognition", null);
        Reflect.set(window, "webkitSpeechRecognition", class {});
        expect(isSpeechRecognitionSupported()).toBe(true);
    });
});

describe("isSpeechSynthesisSupported", () => {
    const original = Reflect.get(window, "speechSynthesis") as unknown;

    /** useSpeak가 요구하는 전체 표면을 갖춘 정상 구현 */
    function fullSynth(): Record<string, unknown> {
        return {
            speak: () => undefined,
            cancel: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
        };
    }

    afterEach(() => {
        if (original === undefined) {
            Reflect.deleteProperty(window, "speechSynthesis");
        } else {
            Reflect.set(window, "speechSynthesis", original);
        }
        Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
    });

    // ── 정상 ──

    it("전체 표면(speak·cancel·이벤트·Utterance 생성자)이 갖춰지면 true", () => {
        Reflect.set(window, "speechSynthesis", fullSynth());
        Reflect.set(window, "SpeechSynthesisUtterance", class {});
        expect(isSpeechSynthesisSupported()).toBe(true);
    });

    // ── 경계·이상 경로 (부분 구현·비정상 globals 방어) ──

    it("speechSynthesis가 없으면 false", () => {
        Reflect.deleteProperty(window, "speechSynthesis");
        expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it("speechSynthesis가 null이어도 에러 없이 false를 반환한다", () => {
        // 'speechSynthesis' in window 는 true지만 프로퍼티 접근이 깨지는 케이스
        Reflect.set(window, "speechSynthesis", null);
        expect(() => isSpeechSynthesisSupported()).not.toThrow();
        expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it("빈 객체({} — speak 누락) 부분 구현이면 false", () => {
        Reflect.set(window, "speechSynthesis", {});
        expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it("speak이 함수가 아닌 위조 구현이면 false", () => {
        Reflect.set(window, "speechSynthesis", { ...fullSynth(), speak: "not-a-function" });
        Reflect.set(window, "SpeechSynthesisUtterance", class {});
        expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it("speak만 있고 cancel·이벤트 구독이 없는 부분 구현이면 false (마운트 크래시 방지)", () => {
        Reflect.set(window, "speechSynthesis", { speak: () => undefined });
        Reflect.set(window, "SpeechSynthesisUtterance", class {});
        expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it("SpeechSynthesisUtterance 생성자가 없으면 false (발화 크래시 방지)", () => {
        Reflect.set(window, "speechSynthesis", fullSynth());
        expect(isSpeechSynthesisSupported()).toBe(false);
    });
});
