import { afterEach, describe, expect, it } from "vitest";
import { listVoices, pickVoice } from "./voices";

function voice(lang: string, voiceURI = `uri:${lang}`): SpeechSynthesisVoice {
    return { lang, voiceURI, name: voiceURI, default: false, localService: true } as SpeechSynthesisVoice;
}

describe("pickVoice", () => {
    // ── 정상 ──

    it("lang 정확 일치 voice를 고른다", () => {
        const koKR = voice("ko-KR");
        expect(pickVoice([voice("en-US"), koKR], { lang: "ko-KR" })).toBe(koKR);
    });

    it("정확 일치가 없으면 primary subtag가 같은 voice로 폴백한다", () => {
        const enGB = voice("en-GB");
        expect(pickVoice([voice("ko-KR"), enGB], { lang: "en-US" })).toBe(enGB);
    });

    it("preferredURI가 있으면 lang보다 우선한다", () => {
        const target = voice("en-GB", "my-voice");
        expect(pickVoice([voice("en-US"), target], { lang: "en-US", preferredURI: "my-voice" })).toBe(target);
    });

    // ── 경계·이상 경로 ──

    it("빈 목록이면 null을 반환한다", () => {
        expect(pickVoice([], { lang: "ko-KR" })).toBeNull();
    });

    it("일치하는 voice가 없으면 null (자의적 폴백 없음)", () => {
        expect(pickVoice([voice("ja-JP")], { lang: "ko-KR" })).toBeNull();
    });

    it("preferredURI가 목록에 없으면 lang 매칭으로 폴백한다", () => {
        const koKR = voice("ko-KR");
        expect(pickVoice([koKR], { lang: "ko-KR", preferredURI: "ghost" })).toBe(koKR);
    });

    it("lang 없이 preferredURI만으로도 고를 수 있다", () => {
        const target = voice("en-US", "only-uri");
        expect(pickVoice([target], { preferredURI: "only-uri" })).toBe(target);
    });

    it("lang도 preferredURI도 없으면 null", () => {
        expect(pickVoice([voice("en-US")], {})).toBeNull();
    });

    it("빈 문자열 lang은 아무것도 매칭하지 않는다", () => {
        expect(pickVoice([voice("en-US")], { lang: "" })).toBeNull();
    });

    // ── 악성·오남용 (오매칭 방어) ──

    it("subtag 유사 접두사(ko vs kok)를 오매칭하지 않는다 — 우회 매칭 방지", () => {
        // "kok"(콘칸어)는 "ko"(한국어)의 primary subtag가 아니다
        expect(pickVoice([voice("kok-IN")], { lang: "ko-KR" })).toBeNull();
    });
});

describe("listVoices", () => {
    const original = Reflect.get(window, "speechSynthesis") as unknown;

    afterEach(() => {
        if (original === undefined) {
            Reflect.deleteProperty(window, "speechSynthesis");
        } else {
            Reflect.set(window, "speechSynthesis", original);
        }
    });

    // ── 정상 ──

    it("getVoices 결과를 반환한다", () => {
        const voices = [voice("ko-KR")];
        Reflect.set(window, "speechSynthesis", { speak: () => undefined, getVoices: () => voices });
        expect(listVoices()).toBe(voices);
    });

    // ── 경계·이상 경로 ──

    it("speechSynthesis 미지원이면 빈 배열", () => {
        Reflect.deleteProperty(window, "speechSynthesis");
        expect(listVoices()).toEqual([]);
    });

    it("getVoices가 없는 부분 구현이어도 에러 없이 빈 배열로 방어한다", () => {
        Reflect.set(window, "speechSynthesis", { speak: () => undefined });
        expect(() => listVoices()).not.toThrow();
        expect(listVoices()).toEqual([]);
    });
});
