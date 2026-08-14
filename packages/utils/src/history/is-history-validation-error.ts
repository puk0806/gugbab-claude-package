/**
 * relay 400 응답이 "이력 트림으로 복구 가능한" 상한 위반인지 판별한다 (재시도 신호).
 * relay가 내려주는 구조화 필드 violation === "history-budget"으로 판정하므로
 * free-form 메시지 문구 변경에 영향받지 않는다.
 * violation 필드는 2026-08-14 이후 relay 스펙이 제공한다 — 필드가 없는 구버전
 * 응답에는 false를 반환하므로 재시도 루프 없이 안전하게 퇴화한다.
 * violation === "message-size"(개별 메시지 길이 초과)는 드롭으로 해결할 수 없는
 * 유형이라 false — 재시도 대신 입력 축소 안내로 대응해야 한다.
 */
export function isHistoryValidationError(body: { errorCode?: string; violation?: string }): boolean {
    return body.errorCode === "VALIDATION_ERROR" && body.violation === "history-budget";
}
