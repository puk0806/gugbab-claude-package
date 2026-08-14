// adversarial-test-guard: allow — 재export 배럴 파일 스모크 테스트 (로직 없음).
// 각 함수의 적대적·경계 테스트는 개별 *.test.ts에서 수행.
import { describe, expect, it } from "vitest";
import { compressHistory, fitMessagesToBudget, isHistoryValidationError, totalContentBytes } from "./index";

describe("history barrel exports", () => {
    it("re-exports all four history functions", () => {
        expect(typeof totalContentBytes).toBe("function");
        expect(typeof fitMessagesToBudget).toBe("function");
        expect(typeof compressHistory).toBe("function");
        expect(typeof isHistoryValidationError).toBe("function");
    });
});
