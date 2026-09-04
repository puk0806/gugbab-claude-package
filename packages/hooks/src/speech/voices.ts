/**
 * speechSynthesis voice 선택 유틸.
 *
 * 브라우저별로 voice가 비동기 로딩(voiceschanged 이벤트)되어 초기 빈 배열 케이스가
 * 흔하다 — listVoices는 "지금 즉시" 사용 가능한 목록만 반환한다.
 */

/** 현재 즉시 사용 가능한 voice 목록. 미지원·부분 구현 환경이면 빈 배열. */
export function listVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined") return [];
    const synth = (window as unknown as Record<string, unknown>).speechSynthesis;
    if (typeof synth !== "object" || synth === null) return [];
    const getVoices = (synth as Record<string, unknown>).getVoices;
    if (typeof getVoices !== "function") return [];
    return (getVoices as () => SpeechSynthesisVoice[]).call(synth);
}

export interface PickVoiceOptions {
    /** 희망 언어 (BCP 47). 정확 일치 → primary subtag 일치 순으로 폴백 */
    lang?: string;
    /** 특정 voiceURI 우선 지정 — lang보다 우선한다 */
    preferredURI?: string | null;
}

/**
 * 우선순위: preferredURI 일치 > lang 정확 일치 > primary subtag 일치 > null.
 * 일치가 없으면 자의적 폴백 없이 null — 폴백 정책은 호출부가 정한다
 * (예: `pickVoice(...) ?? voices[0]`).
 */
export function pickVoice(
    voices: readonly SpeechSynthesisVoice[],
    options: PickVoiceOptions,
): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;

    if (options.preferredURI) {
        const preferred = voices.find((v) => v.voiceURI === options.preferredURI);
        if (preferred) return preferred;
    }

    const lang = options.lang;
    if (!lang) return null;

    const exact = voices.find((v) => v.lang === lang);
    if (exact) return exact;

    // primary subtag 비교 — "ko-KR" vs "kok-IN" 같은 접두사 오매칭 방지
    const primary = lang.split("-")[0];
    return voices.find((v) => v.lang.split("-")[0] === primary) ?? null;
}
