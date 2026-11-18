// adversarial-test-guard: allow — push 카테고리 재export 배럴 스모크 테스트 (로직 없음).
// 적대적·경계 테스트는 support.test.ts·use-push-subscription.test.tsx에서 수행.
import { describe, expect, it } from "vitest";
import * as root from "../index";
import * as push from "./index";

describe("push category exports", () => {
    it("usePushSubscription·getPushSupport를 카테고리와 패키지 루트에서 재export한다", () => {
        for (const mod of [push, root]) {
            expect(typeof mod.usePushSubscription).toBe("function");
            expect(typeof mod.getPushSupport).toBe("function");
        }
    });
});
