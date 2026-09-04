import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isSpeechSynthesisSupported } from "./support";
import { listVoices, pickVoice } from "./voices";

export interface UseSpeakOptions {
    /** 발화 언어 (BCP 47). 생략 시 브라우저 기본 voice에 위임 */
    lang?: string;
    /** 발화 속도 (기본 브라우저 기본값 1) */
    rate?: number;
    /** 특정 voiceURI 우선 지정 — lang 매칭보다 우선 */
    voiceURI?: string | null;
}

export interface UseSpeakReturn {
    readonly speak: (text: string) => void;
    readonly stop: () => void;
    readonly speaking: boolean;
    /** 현재 로딩된 voice 목록 (voiceschanged 반영) */
    readonly voices: readonly SpeechSynthesisVoice[];
    /** 브라우저 지원 여부. SSR 안전 — 첫 렌더는 false, 마운트 후 판정 */
    readonly supported: boolean;
    /** voice 목록 로딩 완료 여부 (브라우저별 비동기 로딩 대응) */
    readonly ready: boolean;
}

/**
 * speechSynthesis 발화(TTS) React 훅.
 *
 * - voice 비동기 로딩(voiceschanged 이벤트) 대응
 * - 새 utterance 전 cancel() 강제 — iOS Safari 백그라운드·큐 폭주 대응
 * - 발화 중 언마운트 시 cancel
 */
export function useSpeak(options: UseSpeakOptions = {}): UseSpeakReturn {
    const { lang, rate, voiceURI } = options;

    const [supported, setSupported] = useState(false);
    const [voices, setVoices] = useState<readonly SpeechSynthesisVoice[]>([]);
    const [speaking, setSpeaking] = useState(false);
    const speakingRef = useRef(false);
    // 현재 활성 utterance — cancel된 이전 utterance의 지연 end/error 이벤트가
    // 새 발화의 speaking 상태를 뒤집지 않도록 식별한다
    const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        setSupported(isSpeechSynthesisSupported());
    }, []);

    useEffect(() => {
        if (!supported) return;
        // synth를 클로저에 캡처 — 언마운트 시점에 전역이 사라져도 해제가 안전하다
        const synth = window.speechSynthesis;
        const handle = () => setVoices(listVoices());
        handle();
        synth.addEventListener("voiceschanged", handle);
        return () => {
            synth.removeEventListener("voiceschanged", handle);
        };
    }, [supported]);

    const voice = useMemo(() => pickVoice(voices, { lang, preferredURI: voiceURI }), [voices, lang, voiceURI]);

    const stop = useCallback(() => {
        if (!isSpeechSynthesisSupported()) return;
        utterRef.current = null;
        window.speechSynthesis.cancel();
        speakingRef.current = false;
        setSpeaking(false);
    }, []);

    const speak = useCallback(
        (text: string) => {
            if (!isSpeechSynthesisSupported() || !text) return;
            window.speechSynthesis.cancel();

            const utter = new SpeechSynthesisUtterance(text);
            if (lang) utter.lang = lang;
            if (rate !== undefined) utter.rate = rate;
            if (voice) utter.voice = voice;

            const settle = () => {
                if (utterRef.current !== utter) return; // 교체된 utterance의 지연 이벤트 무시
                utterRef.current = null;
                speakingRef.current = false;
                setSpeaking(false);
            };
            utter.addEventListener("end", settle);
            utter.addEventListener("error", settle);

            utterRef.current = utter;
            speakingRef.current = true;
            setSpeaking(true);
            window.speechSynthesis.speak(utter);
        },
        [lang, rate, voice],
    );

    useEffect(() => {
        return () => {
            if (speakingRef.current && isSpeechSynthesisSupported()) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { speak, stop, speaking, voices, supported, ready: voices.length > 0 };
}
