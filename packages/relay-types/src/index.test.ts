import { describe, expectTypeOf, it } from "vitest";
import type { AppType, ChatRequest, MessageRole, ModelAlias, SSEEvent } from "./index.js";

describe("relay-types", () => {
    it("AppType is dream | health", () => {
        expectTypeOf<AppType>().toEqualTypeOf<"dream" | "health">();
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
