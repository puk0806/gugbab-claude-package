import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeechRecognition } from "./use-speech-recognition";

interface MockInstance {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: { results: unknown; resultIndex?: number }) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
}

let instances: MockInstance[] = [];

class MockRecognition {
    lang = "";
    continuous = true;
    interimResults = false;
    onresult = null;
    onend = null;
    onerror = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();
    constructor() {
        instances.push(this as unknown as MockInstance);
    }
}

function makeEvent(entries: Array<[transcript: string, isFinal: boolean]>, resultIndex = 0) {
    const results: Record<number | string, unknown> = { length: entries.length };
    entries.forEach(([transcript, isFinal], i) => {
        results[i] = { isFinal, 0: { transcript } };
    });
    return { results, resultIndex };
}

function last(): MockInstance {
    const inst = instances[instances.length - 1];
    if (!inst) throw new Error("no recognition instance created");
    return inst;
}

describe("useSpeechRecognition", () => {
    beforeEach(() => {
        instances = [];
        Reflect.set(window, "SpeechRecognition", MockRecognition);
    });

    afterEach(() => {
        Reflect.deleteProperty(window, "SpeechRecognition");
    });

    // ── 정상 (happy path) ──

    it("초기 상태: listening=false, interimText='', error=null, supported=true", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        expect(result.current.listening).toBe(false);
        expect(result.current.interimText).toBe("");
        expect(result.current.error).toBeNull();
        expect(result.current.supported).toBe(true);
    });

    it("start()로 옵션 lang의 인식 세션을 시작한다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "en-US", onFinal: vi.fn() }));
        act(() => result.current.start());
        expect(result.current.listening).toBe(true);
        expect(last().lang).toBe("en-US");
        expect(last().start).toHaveBeenCalledOnce();
    });

    it("최종 결과는 onFinal로 전달하고 interim은 비운다", () => {
        const onFinal = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal }));
        act(() => result.current.start());
        act(() => last().onresult?.(makeEvent([["중간", false]])));
        expect(result.current.interimText).toBe("중간");
        act(() => last().onresult?.(makeEvent([["최종 문장", true]])));
        expect(onFinal).toHaveBeenCalledWith("최종 문장");
        expect(result.current.interimText).toBe("");
    });

    it("stop()은 세션을 멈추고 상태를 초기화한다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        act(() => last().onresult?.(makeEvent([["중간", false]])));
        act(() => result.current.stop());
        expect(last().stop).toHaveBeenCalledOnce();
        expect(result.current.listening).toBe(false);
        expect(result.current.interimText).toBe("");
    });

    it("toggle()은 listening 여부에 따라 start/stop을 전환한다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.toggle());
        expect(result.current.listening).toBe(true);
        act(() => result.current.toggle());
        expect(result.current.listening).toBe(false);
    });

    // ── 경계·이상 경로 (edge) ──

    it("인식이 스스로 종료(onend)되면 listening=false, interim 비움", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        act(() => last().onresult?.(makeEvent([["중간", false]])));
        act(() => last().onend?.());
        expect(result.current.listening).toBe(false);
        expect(result.current.interimText).toBe("");
    });

    it("에러 이벤트 시 정규화된 error를 노출하고 세션을 종료한다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        act(() => last().onerror?.({ error: "not-allowed" }));
        expect(result.current.error).toBe("not-allowed");
        expect(result.current.listening).toBe(false);
    });

    it("재시작하면 이전 error가 초기화된다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        act(() => last().onerror?.({ error: "network" }));
        expect(result.current.error).toBe("network");
        act(() => result.current.start());
        expect(result.current.error).toBeNull();
    });

    it("언마운트 시 진행 중인 세션을 abort한다", () => {
        const { result, unmount } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        const inst = last();
        unmount();
        expect(inst.abort).toHaveBeenCalled();
    });

    it("abort()는 세션을 즉시 파기하고 늦은 최종 결과를 무시한다 (전송 직후 입력 오염 방지)", () => {
        const onFinal = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal }));
        act(() => result.current.start());
        const inst = last();
        act(() => result.current.abort());
        expect(inst.abort).toHaveBeenCalled();
        expect(result.current.listening).toBe(false);
        expect(result.current.interimText).toBe("");
        // abort 이후 브라우저가 비동기로 흘려보내는 최종 결과는 무시되어야 한다
        act(() => inst.onresult?.(makeEvent([["늦은 결과", true]])));
        expect(onFinal).not.toHaveBeenCalled();
    });

    // ── 악성·오남용 (adversarial) ──

    it("미지원 환경에서 start()해도 예외 없이 error='unknown'으로 방어한다", () => {
        Reflect.deleteProperty(window, "SpeechRecognition");
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        expect(result.current.supported).toBe(false);
        expect(() => act(() => result.current.start())).not.toThrow();
        expect(result.current.listening).toBe(false);
        expect(result.current.error).toBe("unknown");
    });

    it("연타로 start()를 다시 호출하면 이전 인스턴스를 abort하고 새 세션을 연다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        const first = last();
        act(() => result.current.start());
        expect(first.abort).toHaveBeenCalled();
        expect(instances).toHaveLength(2);
        expect(result.current.listening).toBe(true);
    });

    it("교체된 이전 인스턴스의 지연 콜백(onend·onerror)은 새 세션 상태를 뒤집지 못한다", () => {
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));
        act(() => result.current.start());
        const first = last();
        act(() => result.current.start());
        // 이전 세션의 늦은 onend/onerror 도착 (abort 이후 브라우저가 비동기로 쏘는 케이스)
        act(() => first.onend?.());
        act(() => first.onerror?.({ error: "network" }));
        expect(result.current.listening).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it("부분 구현(stop·abort 누락) 환경에서 재시도·언마운트가 크래시하지 않는다", () => {
        class PartialRecognition {
            lang = "";
            continuous = false;
            interimResults = false;
            start = vi.fn();
            // stop·abort 누락 — createRecognizer가 거부해야 하는 표면
        }
        Reflect.set(window, "SpeechRecognition", PartialRecognition);
        const { result, unmount } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal: vi.fn() }));

        expect(() => act(() => result.current.start())).not.toThrow();
        expect(result.current.error).toBe("unknown");
        expect(result.current.listening).toBe(false);
        // 오염된 핸들이 남지 않아 재시도와 언마운트 모두 안전하다
        expect(() => act(() => result.current.start())).not.toThrow();
        expect(() => unmount()).not.toThrow();
    });

    it("교체된 이전 인스턴스의 지연 결과는 onFinal로 전달되지 않는다 (중복 입력 위조 방지)", () => {
        const onFinal = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition({ lang: "ko-KR", onFinal }));
        act(() => result.current.start());
        const first = last();
        act(() => result.current.start());
        act(() => first.onresult?.(makeEvent([["유령 입력", true]])));
        expect(onFinal).not.toHaveBeenCalled();
    });
});
