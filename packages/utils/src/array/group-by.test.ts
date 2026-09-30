import { describe, expect, it } from "vitest";
import { groupBy } from "./group-by";

describe("groupBy", () => {
    it("groups items by string key", () => {
        const users = [
            { name: "Ada", role: "admin" },
            { name: "Ben", role: "member" },
            { name: "Cam", role: "admin" },
        ];
        expect(groupBy(users, (u) => u.role)).toEqual({
            admin: [
                { name: "Ada", role: "admin" },
                { name: "Cam", role: "admin" },
            ],
            member: [{ name: "Ben", role: "member" }],
        });
    });

    it("groups items by number key", () => {
        expect(groupBy([1.1, 2.3, 1.9, 2.8], (n) => Math.floor(n))).toEqual({
            1: [1.1, 1.9],
            2: [2.3, 2.8],
        });
    });

    it("passes index to key function", () => {
        const grouped = groupBy(["a", "b", "c", "d"], (_, i) => (i % 2 === 0 ? "even" : "odd"));
        expect(grouped).toEqual({ even: ["a", "c"], odd: ["b", "d"] });
    });

    it("returns empty object for empty input", () => {
        expect(groupBy<number, string>([], (n) => String(n))).toEqual({});
    });

    describe("예약·상속 키 (악성 입력 방어)", () => {
        it("toString·constructor 키로 그룹화해도 크래시하지 않는다", () => {
            const result = groupBy(["a", "b", "c"], (_, i) => (i === 0 ? "toString" : "constructor"));
            expect(result.toString).toEqual(["a"]);
            expect(result.constructor).toEqual(["b", "c"]);
        });

        it("__proto__ 키는 자기 속성으로 저장되고 프로토타입을 바꾸지 않는다", () => {
            const result = groupBy([1, 2], () => "__proto__");
            expect(Object.hasOwn(result, "__proto__")).toBe(true);
            expect(Object.getOwnPropertyDescriptor(result, "__proto__")?.value).toEqual([1, 2]);
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        it("일반 키와 예약 키가 섞여도 순서를 보존한다 (경계)", () => {
            const result = groupBy(["x", "y", "z"], (v) => (v === "y" ? "hasOwnProperty" : "normal"));
            expect(result.normal).toEqual(["x", "z"]);
            expect(result.hasOwnProperty).toEqual(["y"]);
        });
    });
});
