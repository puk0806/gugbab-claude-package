import { describe, expect, it } from "vitest";
import { isVapidPublicKey } from "./is-vapid-public-key";

// 테스트 전용으로 생성한 P-256 키쌍 (실서비스 키 아님)
const PUBLIC_KEY = "BLeVBuFmLkmVtoKZEUfw2ewrOFZmDUpCuFKPav4b2kWx1PK6NlllBQrSLYGrSjZ43wwT-bcE989M4cx6u9zaM-I";
const PRIVATE_KEY = "DGW-W_O1mQjSau6R7axmTnNAjl0v0-pykIivIuenET0";

describe("isVapidPublicKey", () => {
    // ── 정상 (happy path) ──

    it("65바이트·0x04 시작 공개키는 true", () => {
        expect(isVapidPublicKey(PUBLIC_KEY)).toBe(true);
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("빈 문자열·문자열 아님은 false", () => {
        expect(isVapidPublicKey("")).toBe(false);
        expect(isVapidPublicKey(undefined)).toBe(false);
        expect(isVapidPublicKey(null)).toBe(false);
        expect(isVapidPublicKey(65)).toBe(false);
    });

    it("한 글자 잘린 키는 false", () => {
        expect(isVapidPublicKey(PUBLIC_KEY.slice(0, -1))).toBe(false);
    });

    it("첫 바이트가 0x04가 아니면 false (압축 키·다른 형식)", () => {
        // 첫 글자 B(0b000001) → C 로 바꾸면 첫 바이트가 0x08 계열로 바뀐다
        expect(isVapidPublicKey(`C${PUBLIC_KEY.slice(1)}`)).toBe(false);
    });

    // ── 악성·오남용 (adversarial) ──

    it("비밀키(32바이트)를 공개키 자리에 넣으면 false", () => {
        expect(isVapidPublicKey(PRIVATE_KEY)).toBe(false);
    });

    it("초장문 입력은 디코딩 전에 거부", () => {
        expect(isVapidPublicKey("A".repeat(10_000))).toBe(false);
    });

    it("허용 문자 외 입력은 throw 없이 false", () => {
        expect(isVapidPublicKey("<img src=x onerror=alert(1)>")).toBe(false);
    });
});
