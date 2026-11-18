// adversarial-test-guard: allow — push 모듈 재export 배럴 스모크 테스트 (로직 없음).
// 각 함수의 적대적·경계 테스트는 해당 *.test.ts에서 수행.
import { describe, expect, it } from "vitest";
import * as root from "../index";
import * as push from "./index";

describe("push module exports", () => {
    it("push 함수 3종을 모듈과 패키지 루트에서 재export한다", () => {
        for (const mod of [push, root]) {
            expect(typeof mod.urlBase64ToUint8Array).toBe("function");
            expect(typeof mod.isVapidPublicKey).toBe("function");
            expect(typeof mod.serializePushSubscription).toBe("function");
        }
    });
});
