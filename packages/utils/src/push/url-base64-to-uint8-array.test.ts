import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "./url-base64-to-uint8-array";

describe("urlBase64ToUint8Array", () => {
    // ── 정상 (happy path) ──

    it("패딩 없는 base64url을 디코딩한다", () => {
        // "hello" → aGVsbG8
        expect(Array.from(urlBase64ToUint8Array("aGVsbG8"))).toEqual([104, 101, 108, 108, 111]);
    });

    it("-·_ 문자를 +·/ 로 바꿔 디코딩한다", () => {
        // 0xfb 0xff → "-_8"
        expect(Array.from(urlBase64ToUint8Array("-_8"))).toEqual([0xfb, 0xff]);
    });

    it("표준 base64(+·/·패딩)도 받는다", () => {
        expect(Array.from(urlBase64ToUint8Array("+/8="))).toEqual([0xfb, 0xff]);
    });

    it("앞뒤 공백(환경변수 복붙)은 무시한다", () => {
        expect(Array.from(urlBase64ToUint8Array("  aGVsbG8\n"))).toEqual([104, 101, 108, 108, 111]);
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("빈 문자열은 빈 배열", () => {
        expect(urlBase64ToUint8Array("")).toHaveLength(0);
    });

    it("길이 % 4 === 1 은 디코딩 불가로 TypeError", () => {
        expect(() => urlBase64ToUint8Array("a")).toThrow(TypeError);
        expect(() => urlBase64ToUint8Array("aGVsb")).toThrow(TypeError);
    });

    it("패딩이 3개 이상이면 TypeError", () => {
        expect(() => urlBase64ToUint8Array("aGVsbG8===")).toThrow(TypeError);
    });

    // ── 악성·오남용 (adversarial) ──

    it("허용 문자 외(공백 중간·제어문자·HTML) 입력은 TypeError", () => {
        expect(() => urlBase64ToUint8Array("aGV sbG8")).toThrow(TypeError);
        expect(() => urlBase64ToUint8Array("aGVs\u0000bG8")).toThrow(TypeError);
        expect(() => urlBase64ToUint8Array("<script>alert(1)</script>")).toThrow(TypeError);
    });

    it("문자열이 아닌 입력은 TypeError", () => {
        expect(() => urlBase64ToUint8Array(123 as unknown as string)).toThrow(TypeError);
        expect(() => urlBase64ToUint8Array(null as unknown as string)).toThrow(TypeError);
    });
});
