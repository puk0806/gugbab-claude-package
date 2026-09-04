/**
 * 음성 인식 최종 결과를 기존 입력에 공백 한 칸으로 이어붙인다.
 *
 * `<input maxLength>` 속성은 프로그램적 setState를 막지 못하므로 여기서 상한을
 * 강제하고, 절단 지점이 서로게이트 쌍(이모지 등) 중간이면 한 코드유닛 더 제거해
 * 깨진 문자를 남기지 않는다.
 *
 * @param prev - 기존 입력값
 * @param transcript - 이어붙일 인식 결과
 * @param max - 결과 문자열 상한(code unit 기준). 생략 시 무제한, 0 이하이면 빈 문자열
 */
export function appendTranscript(prev: string, transcript: string, max?: number): string {
    if (!transcript) return max !== undefined && prev.length > max ? cutSafe(prev, max) : prev;
    const composed = prev ? `${prev} ${transcript}` : transcript;
    if (max === undefined || composed.length <= max) return composed;
    return cutSafe(composed, max);
}

function cutSafe(text: string, max: number): string {
    if (max <= 0) return "";
    const cut = text.slice(0, max);
    const last = cut.charCodeAt(cut.length - 1);
    // high surrogate로 끝나면 쌍이 잘린 것 — 한 유닛 더 제거
    return last >= 0xd800 && last <= 0xdbff ? cut.slice(0, -1) : cut;
}
