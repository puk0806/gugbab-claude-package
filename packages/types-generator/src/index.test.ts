import { describe, expect, it } from "vitest";
import { generateTypes } from "./index.js";

describe("generateTypes", () => {
    it("is a function", () => {
        expect(typeof generateTypes).toBe("function");
    });

    it("returns a Promise", () => {
        const result = generateTypes({ input: "", output: "" });
        expect(result).toBeInstanceOf(Promise);
        result.catch(() => {});
    });
});
