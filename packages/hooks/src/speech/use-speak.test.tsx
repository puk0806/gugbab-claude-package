import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeak } from "./use-speak";

interface MockUtteranceInstance {
    text: string;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    rate: number;
    fire(type: "end" | "error"): void;
}

let utterances: MockUtteranceInstance[] = [];

class MockUtterance {
    text: string;
    lang = "";
    voice: SpeechSynthesisVoice | null = null;
    rate = 1;
    private listeners: Record<string, Array<() => void>> = {};
    constructor(text: string) {
        this.text = text;
        utterances.push(this as unknown as MockUtteranceInstance);
    }
    addEventListener(type: string, cb: () => void) {
        const list = this.listeners[type] ?? [];
        list.push(cb);
        this.listeners[type] = list;
    }
    fire(type: string) {
        for (const cb of this.listeners[type] ?? []) cb();
    }
}

function voice(lang: string, voiceURI = `uri:${lang}`): SpeechSynthesisVoice {
    return { lang, voiceURI, name: voiceURI, default: false, localService: true } as SpeechSynthesisVoice;
}

const speakMock = vi.fn();
const cancelMock = vi.fn();
let voiceList: SpeechSynthesisVoice[] = [];
let voicesChangedHandler: (() => void) | null = null;

const synthMock = {
    speak: speakMock,
    cancel: cancelMock,
    getVoices: () => voiceList,
    addEventListener: (type: string, cb: () => void) => {
        if (type === "voiceschanged") voicesChangedHandler = cb;
    },
    removeEventListener: vi.fn(),
};

describe("useSpeak", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        utterances = [];
        voiceList = [voice("ko-KR"), voice("en-US")];
        voicesChangedHandler = null;
        Reflect.set(window, "speechSynthesis", synthMock);
        vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Reflect.deleteProperty(window, "speechSynthesis");
    });

    // ── 정상 (happy path) ──

    it("supported=true, 초기 speaking=false", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        expect(result.current.supported).toBe(true);
        expect(result.current.speaking).toBe(false);
    });

    it("speak()는 이전 발화를 cancel하고 lang·voice를 실어 발화한다", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("안녕하세요"));
        expect(cancelMock).toHaveBeenCalled();
        expect(speakMock).toHaveBeenCalledOnce();
        expect(utterances[0]?.text).toBe("안녕하세요");
        expect(utterances[0]?.lang).toBe("ko-KR");
        expect(utterances[0]?.voice?.lang).toBe("ko-KR");
        expect(result.current.speaking).toBe(true);
    });

    it("발화가 끝나면 speaking=false", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("안녕"));
        act(() => utterances[0]?.fire("end"));
        expect(result.current.speaking).toBe(false);
    });

    it("stop()은 발화를 취소하고 speaking=false", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("안녕"));
        act(() => result.current.stop());
        expect(cancelMock).toHaveBeenCalledTimes(2); // speak 시 1회 + stop 시 1회
        expect(result.current.speaking).toBe(false);
    });

    it("rate 옵션이 utterance에 반영된다", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR", rate: 0.8 }));
        act(() => result.current.speak("천천히"));
        expect(utterances[0]?.rate).toBe(0.8);
    });

    it("voiceURI 지정 시 해당 voice를 우선 사용한다", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR", voiceURI: "uri:en-US" }));
        act(() => result.current.speak("hello"));
        expect(utterances[0]?.voice?.voiceURI).toBe("uri:en-US");
    });

    // ── 경계·이상 경로 (edge) ──

    it("빈 텍스트는 발화하지 않는다", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak(""));
        expect(speakMock).not.toHaveBeenCalled();
        expect(result.current.speaking).toBe(false);
    });

    it("voiceschanged로 늦게 로딩된 voice 목록을 반영한다 (초기 빈 배열 케이스)", () => {
        voiceList = [];
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        expect(result.current.ready).toBe(false);
        voiceList = [voice("ko-KR")];
        act(() => voicesChangedHandler?.());
        expect(result.current.ready).toBe(true);
        expect(result.current.voices).toHaveLength(1);
    });

    it("발화 에러 이벤트에도 speaking=false로 복구한다", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("안녕"));
        act(() => utterances[0]?.fire("error"));
        expect(result.current.speaking).toBe(false);
    });

    it("발화 중 언마운트하면 cancel한다 (백그라운드 발화 잔류 방지)", () => {
        const { result, unmount } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("안녕"));
        cancelMock.mockClear();
        unmount();
        expect(cancelMock).toHaveBeenCalled();
    });

    it("일치 voice가 없으면 voice 미지정으로 발화한다 (브라우저 기본 voice 위임)", () => {
        voiceList = [voice("ja-JP")];
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("안녕"));
        expect(utterances[0]?.voice).toBeNull();
        expect(utterances[0]?.lang).toBe("ko-KR");
    });

    // ── 악성·오남용 (adversarial) ──

    it("미지원 환경에서 speak()해도 예외 없이 no-op으로 방어한다", () => {
        Reflect.deleteProperty(window, "speechSynthesis");
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        expect(result.current.supported).toBe(false);
        expect(() => act(() => result.current.speak("안녕"))).not.toThrow();
        expect(result.current.speaking).toBe(false);
    });

    it("speak만 있는 부분 구현(cancel·이벤트 누락)은 미지원 판정 — 마운트·발화 모두 크래시하지 않는다", () => {
        const speakOnly = vi.fn();
        Reflect.set(window, "speechSynthesis", { speak: speakOnly });
        const { result, unmount } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        expect(result.current.supported).toBe(false);
        expect(() => act(() => result.current.speak("안녕"))).not.toThrow();
        expect(speakOnly).not.toHaveBeenCalled();
        expect(() => unmount()).not.toThrow();
    });

    it("연속 speak() 호출 시 매번 이전 발화를 cancel한다 (큐 폭주 방지)", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("하나"));
        act(() => result.current.speak("둘"));
        expect(cancelMock).toHaveBeenCalledTimes(2);
        expect(speakMock).toHaveBeenCalledTimes(2);
    });

    it("cancel된 이전 utterance의 지연 end 이벤트는 새 발화의 speaking을 뒤집지 못한다", () => {
        const { result } = renderHook(() => useSpeak({ lang: "ko-KR" }));
        act(() => result.current.speak("하나"));
        act(() => result.current.speak("둘"));
        // 브라우저가 cancel 이후 비동기로 쏘는 이전 utterance의 늦은 end/error
        act(() => utterances[0]?.fire("end"));
        act(() => utterances[0]?.fire("error"));
        expect(result.current.speaking).toBe(true);
        // 현재 utterance의 end만 상태를 종료시킨다
        act(() => utterances[1]?.fire("end"));
        expect(result.current.speaking).toBe(false);
    });
});
