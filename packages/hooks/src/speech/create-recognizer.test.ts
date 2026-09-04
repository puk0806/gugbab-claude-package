import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRecognizer } from "./create-recognizer";

const startMock = vi.fn();
const stopMock = vi.fn();
const abortMock = vi.fn();

interface MockInstance {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: { results: unknown; resultIndex?: number }) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: { error: string }) => void) | null;
}

let lastInstance: MockInstance | null = null;

class MockRecognition {
    lang = "";
    continuous = true;
    interimResults = false;
    onresult = null;
    onend = null;
    onerror = null;
    start = startMock;
    stop = stopMock;
    abort = abortMock;
    constructor() {
        lastInstance = this as unknown as MockInstance;
    }
}

/** Web Speech API onresult 이벤트 모사 — results는 세션 누적 목록 */
function makeEvent(entries: Array<[transcript: string, isFinal: boolean]>, resultIndex?: number) {
    const results: Record<number | string, unknown> = { length: entries.length };
    entries.forEach(([transcript, isFinal], i) => {
        results[i] = { isFinal, 0: { transcript } };
    });
    return resultIndex === undefined ? { results } : { results, resultIndex };
}

describe("createRecognizer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        lastInstance = null;
        Reflect.set(window, "SpeechRecognition", MockRecognition);
    });

    afterEach(() => {
        Reflect.deleteProperty(window, "SpeechRecognition");
    });

    // ── 정상 (happy path) ──

    it("옵션의 lang과 기본 설정(continuous=false, interimResults=true)으로 인스턴스를 만든다", () => {
        createRecognizer({ lang: "ko-KR", onResult: vi.fn() });
        expect(lastInstance?.lang).toBe("ko-KR");
        expect(lastInstance?.continuous).toBe(false);
        expect(lastInstance?.interimResults).toBe(true);
    });

    it("continuous·interimResults를 옵션으로 덮어쓸 수 있다", () => {
        createRecognizer({ lang: "en-US", continuous: true, interimResults: false, onResult: vi.fn() });
        expect(lastInstance?.continuous).toBe(true);
        expect(lastInstance?.interimResults).toBe(false);
    });

    it("최종/중간 결과를 isFinal 플래그와 함께 전달한다", () => {
        const onResult = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult });

        lastInstance?.onresult?.(makeEvent([["안녕", false]], 0));
        expect(onResult).toHaveBeenCalledWith("안녕", false);

        lastInstance?.onresult?.(makeEvent([["안녕하세요", true]], 0));
        expect(onResult).toHaveBeenCalledWith("안녕하세요", true);
    });

    it("start/stop/abort가 내부 인스턴스로 위임된다", () => {
        const rec = createRecognizer({ lang: "ko-KR", onResult: vi.fn() });
        rec.start();
        rec.stop();
        rec.abort();
        expect(startMock).toHaveBeenCalledOnce();
        expect(stopMock).toHaveBeenCalledOnce();
        expect(abortMock).toHaveBeenCalledOnce();
    });

    it("인식 종료 시 onEnd를 호출한다", () => {
        const onEnd = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult: vi.fn(), onEnd });
        lastInstance?.onend?.();
        expect(onEnd).toHaveBeenCalledOnce();
    });

    it("webkitSpeechRecognition만 있어도 동작한다", () => {
        Reflect.deleteProperty(window, "SpeechRecognition");
        Reflect.set(window, "webkitSpeechRecognition", MockRecognition);
        createRecognizer({ lang: "en-US", onResult: vi.fn() });
        expect(lastInstance?.lang).toBe("en-US");
        Reflect.deleteProperty(window, "webkitSpeechRecognition");
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("한 이벤트에 final + interim이 배치되면 둘 다 전달한다 (final 유실 방지)", () => {
        const onResult = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult });

        lastInstance?.onresult?.(
            makeEvent(
                [
                    ["확정 문장", true],
                    ["새 중간", false],
                ],
                0,
            ),
        );
        expect(onResult).toHaveBeenNthCalledWith(1, "확정 문장", true);
        expect(onResult).toHaveBeenNthCalledWith(2, "새 중간", false);
    });

    it("resultIndex 없는 비표준 구현에서도 이전 final을 중복 재생하지 않는다", () => {
        const onResult = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult });

        // 1차 이벤트: 첫 문장 확정
        lastInstance?.onresult?.(makeEvent([["첫 문장", true]]));
        // 2차 이벤트: 누적 목록 (이미 확정된 첫 문장 + 새 interim)
        lastInstance?.onresult?.(
            makeEvent([
                ["첫 문장", true],
                ["둘째", false],
            ]),
        );

        const finalCalls = onResult.mock.calls.filter(([, isFinal]) => isFinal === true);
        expect(finalCalls).toHaveLength(1);
        expect(onResult).toHaveBeenLastCalledWith("둘째", false);
    });

    it("빈 results(length=0) 이벤트에도 크래시 없이 무시한다", () => {
        const onResult = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult });
        expect(() => lastInstance?.onresult?.(makeEvent([]))).not.toThrow();
        expect(onResult).not.toHaveBeenCalled();
    });

    it("transcript가 누락된 비정상 결과는 빈 문자열로 방어한다", () => {
        const onResult = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult });
        lastInstance?.onresult?.({ results: { length: 1, 0: { isFinal: true } }, resultIndex: 0 });
        expect(onResult).toHaveBeenCalledWith("", true);
    });

    // ── 악성·오남용 / 에러 경로 (adversarial) ──

    it("SpeechRecognition 미지원 환경에서는 명시적으로 throw한다", () => {
        Reflect.deleteProperty(window, "SpeechRecognition");
        expect(() => createRecognizer({ lang: "ko-KR", onResult: vi.fn() })).toThrow();
    });

    it("생성자가 아닌 위조 전역(SpeechRecognition = {})이면 throw한다", () => {
        Reflect.set(window, "SpeechRecognition", {});
        expect(() => createRecognizer({ lang: "ko-KR", onResult: vi.fn() })).toThrow();
    });

    it("start/stop/abort가 불완전한 부분 구현 인스턴스면 throw한다 (핸들 오염 방지)", () => {
        class PartialRecognition {
            lang = "";
            continuous = false;
            interimResults = false;
            start = vi.fn();
            // stop·abort 누락
        }
        Reflect.set(window, "SpeechRecognition", PartialRecognition);
        expect(() => createRecognizer({ lang: "ko-KR", onResult: vi.fn() })).toThrow();
    });

    it.each([
        ["not-allowed", "not-allowed"],
        ["permission-denied", "not-allowed"],
        ["no-speech", "no-speech"],
        ["network", "network"],
        ["service-not-allowed", "unknown"],
        ["", "unknown"],
    ])("브라우저 에러 %s → MicError %s로 매핑한다", (raw, mapped) => {
        const onError = vi.fn();
        createRecognizer({ lang: "ko-KR", onResult: vi.fn(), onError });
        lastInstance?.onerror?.({ error: raw });
        expect(onError).toHaveBeenCalledWith(mapped);
    });

    it("onError 미지정 시 에러 이벤트에도 크래시하지 않는다", () => {
        createRecognizer({ lang: "ko-KR", onResult: vi.fn() });
        expect(() => lastInstance?.onerror?.({ error: "network" })).not.toThrow();
    });
});
