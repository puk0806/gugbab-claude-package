// adversarial-test-guard: allow — 패키지 루트 재export 배럴 스모크 테스트 (로직 없음).
// 각 모듈의 적대적·경계 테스트는 해당 모듈의 *.test.ts에서 수행.
import { describe, expect, it } from "vitest";
import * as utils from "./index";

describe("package root exports", () => {
    it("re-exports the history module at the package root", () => {
        expect(typeof utils.totalContentBytes).toBe("function");
        expect(typeof utils.fitMessagesToBudget).toBe("function");
        expect(typeof utils.compressHistory).toBe("function");
        expect(typeof utils.isHistoryValidationError).toBe("function");
    });
});
