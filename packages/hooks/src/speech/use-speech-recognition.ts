import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "../ref/use-latest-ref";
import { createRecognizer, type MicError, type SpeechRecognizer } from "./create-recognizer";
import { isSpeechRecognitionSupported } from "./support";

export interface UseSpeechRecognitionOptions {
    /** 인식 언어 (BCP 47, 예: "ko-KR", "en-US") */
    lang: string;
    /** 발화가 끊겨도 세션을 유지할지 (기본 false) */
    continuous?: boolean;
    /** 중간(interim) 결과를 interimText로 노출할지 (기본 true) */
    interimResults?: boolean;
    /** 최종 확정 결과 콜백 — 입력 반영(이어붙이기·상한 등)은 호출부 정책에 맡긴다 */
    onFinal: (transcript: string) => void;
}

export interface UseSpeechRecognitionReturn {
    /** 브라우저 지원 여부. SSR 안전 — 첫 렌더는 false, 마운트 후 판정 */
    readonly supported: boolean;
    /** 인식 세션 진행 중 여부 */
    readonly listening: boolean;
    /** 중간(interim) 인식 텍스트 — 힌트 표시용 */
    readonly interimText: string;
    /** 마지막 세션의 정규화된 에러. start() 시 초기화 */
    readonly error: MicError | null;
    readonly start: () => void;
    readonly stop: () => void;
    readonly toggle: () => void;
}

/**
 * Web Speech API 음성 인식(STT) React 훅.
 *
 * - listening / interimText / error 상태 관리 일체 포함
 * - 세션 교체 시 이전 인스턴스의 지연 콜백이 새 세션 상태를 뒤집지 않도록 가드
 * - 언마운트 시 진행 중 세션 abort
 * - 에러 문구는 노출하지 않는다 — `MicError` 분류만 반환하고 메시지는 앱이 정한다
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
    const { lang, continuous, interimResults } = options;
    const onFinalRef = useLatestRef(options.onFinal);

    const [supported, setSupported] = useState(false);
    const [listening, setListening] = useState(false);
    const [interimText, setInterimText] = useState("");
    const [error, setError] = useState<MicError | null>(null);
    const recognizerRef = useRef<SpeechRecognizer | null>(null);

    useEffect(() => {
        setSupported(isSpeechRecognitionSupported());
    }, []);

    useEffect(() => {
        return () => {
            recognizerRef.current?.abort();
        };
    }, []);

    const start = useCallback(() => {
        setError(null);
        // ref를 먼저 비워, 이전 인스턴스의 abort가 실패해도(비정상 구현)
        // 오염된 핸들이 남아 이후 재시도·언마운트를 막지 않게 한다
        const prev = recognizerRef.current;
        recognizerRef.current = null;

        try {
            prev?.abort();
            // 콜백마다 자신이 현재 활성 인스턴스인지 확인 — 교체된 인스턴스의
            // 지연 콜백(onend/onerror/onResult)이 새 세션 상태를 오염시키지 않도록
            const rec: SpeechRecognizer = createRecognizer({
                lang,
                continuous,
                interimResults,
                onResult: (transcript, isFinal) => {
                    if (recognizerRef.current !== rec) return;
                    if (isFinal) {
                        onFinalRef.current(transcript);
                        setInterimText("");
                    } else {
                        setInterimText(transcript);
                    }
                },
                onEnd: () => {
                    if (recognizerRef.current !== rec) return;
                    setListening(false);
                    setInterimText("");
                },
                onError: (type) => {
                    if (recognizerRef.current !== rec) return;
                    setListening(false);
                    setInterimText("");
                    setError(type);
                },
            });
            recognizerRef.current = rec;
            rec.start();
            setListening(true);
        } catch {
            // 미지원·부분 구현 환경 등 — 크래시 대신 정규화된 에러로 노출하고
            // 실패한 핸들을 남기지 않는다
            recognizerRef.current = null;
            setListening(false);
            setError("unknown");
        }
    }, [lang, continuous, interimResults, onFinalRef]);

    const stop = useCallback(() => {
        recognizerRef.current?.stop();
        setListening(false);
        setInterimText("");
    }, []);

    const toggle = useCallback(() => {
        if (listening) {
            stop();
        } else {
            start();
        }
    }, [listening, start, stop]);

    return { supported, listening, interimText, error, start, stop, toggle };
}
