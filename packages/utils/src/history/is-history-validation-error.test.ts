// adversarial-test-guard: allow — boolean 판별 순수 함수로 예외를 던지지 않고 false를
// 반환하는 것이 계약임 (재시도 루프 차단이 목적). 오탐(message-size를 true로 판정 →
// 무한 재시도)·필드 누락·유사 문자열 우회 같은 부정·경계 경로를 집중 커버.
import { describe, expect, it } from "vitest";
import { isHistoryValidationError } from "./is-history-validation-error";

describe("isHistoryValidationError", () => {
    it("returns true for VALIDATION_ERROR with history-budget violation", () => {
        expect(isHistoryValidationError({ errorCode: "VALIDATION_ERROR", violation: "history-budget" })).toBe(true);
    });

    // 오탐 방지: message-size는 드롭으로 복구 불가 — true로 판정하면 무한 재시도 루프
    it("returns false for message-size violation (must not trigger retry)", () => {
        expect(isHistoryValidationError({ errorCode: "VALIDATION_ERROR", violation: "message-size" })).toBe(false);
    });

    // 경계: violation 필드 누락 (구버전 relay 또는 다른 검증 오류)
    it("returns false when violation is missing", () => {
        expect(isHistoryValidationError({ errorCode: "VALIDATION_ERROR" })).toBe(false);
    });

    it("returns false for other error codes even with history-budget violation", () => {
        expect(isHistoryValidationError({ errorCode: "RATE_LIMITED", violation: "history-budget" })).toBe(false);
        expect(isHistoryValidationError({ violation: "history-budget" })).toBe(false);
    });

    // 경계: 빈 객체 — 필드가 하나도 없어도 깨지지 않고 false
    it("returns false for an empty body", () => {
        expect(isHistoryValidationError({})).toBe(false);
    });

    // 비정상: 유사 문자열·대소문자 변형은 정확 일치가 아니므로 거부
    it("requires exact matches, rejecting look-alike values", () => {
        expect(isHistoryValidationError({ errorCode: "VALIDATION_ERROR", violation: "history-budget-2" })).toBe(false);
        expect(isHistoryValidationError({ errorCode: "VALIDATION_ERROR", violation: "History-Budget" })).toBe(false);
        expect(isHistoryValidationError({ errorCode: "validation_error", violation: "history-budget" })).toBe(false);
    });
});
