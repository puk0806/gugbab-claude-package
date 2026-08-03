// adversarial-test-guard: allow — 타입 레벨(expectTypeOf) 전용 스위트로 런타임 에러·보안·경계 경로가 존재하지 않음
import { describe, expectTypeOf, it } from "vitest";
import type { AppType, ChatRequest, MessageRole, ModelAlias, SSEEvent } from "./index.js";

describe("relay-types", () => {
    // toEqualTypeOf(정확 일치)를 쓰면 relay에 앱이 추가될 때마다 재생성 타입과 기대값이
    // 어긋나 publish 워크플로우가 깨진다 (english 추가로 실제 3주간 publish 중단).
    // 핵심 앱 멤버십만 검증해 신규 앱 추가에 열려 있게 한다.
    it("AppType은 dream·health·english를 포함한다", () => {
        expectTypeOf<"dream">().toMatchTypeOf<AppType>();
        expectTypeOf<"health">().toMatchTypeOf<AppType>();
        expectTypeOf<"english">().toMatchTypeOf<AppType>();
    });

    it("MessageRole is user | assistant", () => {
        expectTypeOf<MessageRole>().toEqualTypeOf<"user" | "assistant">();
    });

    it("ModelAlias covers all four aliases", () => {
        expectTypeOf<ModelAlias>().toEqualTypeOf<"haiku" | "sonnet" | "opus" | "fable">();
    });

    it("ChatRequest has required app and messages fields", () => {
        expectTypeOf<ChatRequest>().toHaveProperty("app");
        expectTypeOf<ChatRequest>().toHaveProperty("messages");
    });

    it("SSEEvent is a discriminated union", () => {
        expectTypeOf<SSEEvent>().toHaveProperty("type");
    });
});
