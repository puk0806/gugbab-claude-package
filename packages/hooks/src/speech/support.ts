/**
 * Web Speech API 지원 여부 감지.
 *
 * 브라우저 전용 — SSR에서는 항상 false. 부분 구현(프로퍼티는 있으나 null이거나
 * 함수가 없는 경우)도 미지원으로 판정해 이후 호출부의 크래시를 막는다.
 */

/** SpeechRecognition(STT) 지원 여부. Chrome 계열 위주 — Firefox는 미지원. 생성자 여부까지 확인한다. */
export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    const w = window as unknown as Record<string, unknown>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    return typeof Ctor === "function";
}

/**
 * speechSynthesis(TTS) 지원 여부.
 * useSpeak가 실제로 호출하는 표면 전체(`speak`·`cancel`·이벤트 구독·Utterance 생성자)를
 * 확인한다 — speak만 있는 부분 구현에서 마운트/발화가 크래시하지 않도록.
 * (`getVoices`는 없어도 발화 자체는 가능하므로 요구하지 않는다 — listVoices가 별도 방어)
 */
export function isSpeechSynthesisSupported(): boolean {
    if (typeof window === "undefined") return false;
    const w = window as unknown as Record<string, unknown>;
    const synth = w.speechSynthesis;
    if (typeof synth !== "object" || synth === null) return false;
    const s = synth as Record<string, unknown>;
    return (
        typeof s.speak === "function" &&
        typeof s.cancel === "function" &&
        typeof s.addEventListener === "function" &&
        typeof s.removeEventListener === "function" &&
        typeof w.SpeechSynthesisUtterance === "function"
    );
}
