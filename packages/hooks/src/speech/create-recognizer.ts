/**
 * Web Speech API SpeechRecognition(STT) 래퍼 — 프레임워크 독립 코어.
 *
 * 브라우저 전용. `isSpeechRecognitionSupported()`로 사전 확인하지 않고 호출하면
 * 미지원 환경에서 throw한다.
 *
 * 타입 선언을 직접 갖는 이유: lib.dom.d.ts에 SpeechRecognition 타입이 없다
 * (실험 API). 필요한 표면만 최소로 선언한다.
 */

interface SpeechRecognitionResultLike {
    readonly isFinal: boolean;
    readonly [index: number]: { readonly transcript: string } | undefined;
}

interface SpeechRecognitionResultListLike {
    readonly length: number;
    readonly [index: number]: SpeechRecognitionResultLike | undefined;
}

interface SpeechRecognitionEventLike extends Event {
    readonly results: SpeechRecognitionResultListLike;
    /** 표준 속성이지만 일부 WebKit 구현이 누락 — 방어적으로 optional 취급 */
    readonly resultIndex?: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
    readonly error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

/** 소비자에게 노출하는 정규화된 음성 인식 에러 분류 */
export type MicError = "not-allowed" | "no-speech" | "network" | "unknown";

/** createRecognizer가 반환하는 제어 핸들 */
export interface SpeechRecognizer {
    start(): void;
    stop(): void;
    abort(): void;
}

export interface CreateRecognizerOptions {
    /** 인식 언어 (BCP 47, 예: "ko-KR", "en-US") */
    lang: string;
    /** 발화가 끊겨도 세션을 유지할지 (기본 false) */
    continuous?: boolean;
    /** 중간(interim) 결과도 전달할지 (기본 true) */
    interimResults?: boolean;
    /** 인식 결과 콜백 — interim/final 모두 전달, isFinal로 구분 */
    onResult: (transcript: string, isFinal: boolean) => void;
    /** 인식 세션 종료 콜백 (정상 종료·에러 종료 모두) */
    onEnd?: () => void;
    /** 정규화된 에러 콜백 */
    onError?: (type: MicError) => void;
}

function toMicError(raw: string): MicError {
    if (raw === "not-allowed" || raw === "permission-denied") return "not-allowed";
    if (raw === "no-speech") return "no-speech";
    if (raw === "network") return "network";
    return "unknown";
}

export function createRecognizer(options: CreateRecognizerOptions): SpeechRecognizer {
    // SSR: no window — report the documented "not supported" error instead of a ReferenceError.
    const w = (typeof window === "undefined" ? {} : window) as unknown as Record<string, unknown>;
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined;

    if (typeof Ctor !== "function") {
        throw new Error("SpeechRecognition is not supported in this environment");
    }

    const rec = new Ctor();
    // 부분 구현(WebView·폴리필 스텁) 방어 — 표면이 불완전한 인스턴스를 반환하면
    // 이후 start/stop/abort 호출부가 try 밖에서 크래시할 수 있다
    if (typeof rec.start !== "function" || typeof rec.stop !== "function" || typeof rec.abort !== "function") {
        throw new Error("SpeechRecognition implementation is incomplete");
    }
    rec.lang = options.lang;
    rec.continuous = options.continuous ?? false;
    rec.interimResults = options.interimResults ?? true;

    // resultIndex 없는 비표준 구현용 진행 커서 — 이미 확정(final) 처리한 앞부분을 다시 재생하지 않기 위한 위치
    let nextUnprocessedIndex = 0;
    rec.onresult = (event) => {
        const total = event.results.length;
        if (total === 0) return;
        // 한 이벤트에 여러 결과가 배치될 수 있다(final + 새 interim) — resultIndex부터 전부 전달해 final 유실 방지.
        // resultIndex가 없으면 커서부터 순회: 누적 리스트의 이전 final 중복 재생과 배치 유실을 동시에 방지.
        // (리스트가 이벤트마다 초기화되는 구현도 있어 커서는 마지막 인덱스로 클램프)
        const start = event.resultIndex ?? Math.min(nextUnprocessedIndex, total - 1);
        for (let i = start; i < total; i++) {
            const result = event.results[i];
            if (result) options.onResult(result[0]?.transcript ?? "", result.isFinal);
        }
        let finals = 0;
        while (finals < total && event.results[finals]?.isFinal) finals++;
        nextUnprocessedIndex = finals;
    };
    rec.onend = () => options.onEnd?.();
    rec.onerror = (event) => options.onError?.(toMicError(event.error));

    return {
        start: () => rec.start(),
        stop: () => rec.stop(),
        abort: () => rec.abort(),
    };
}
