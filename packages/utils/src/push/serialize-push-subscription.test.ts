import { describe, expect, it } from "vitest";
import { serializePushSubscription } from "./serialize-push-subscription";

const VALID = {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    expirationTime: null,
    keys: {
        p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
        auth: "tBHItJI5svbpez7KI4CCXg",
    },
};

function sub(json: unknown) {
    return { toJSON: () => json };
}

describe("serializePushSubscription", () => {
    // ── 정상 (happy path) ──

    it("toJSON() 결과를 endpoint·expirationTime·keys 로 옮긴다", () => {
        expect(serializePushSubscription(sub(VALID))).toEqual(VALID);
    });

    it("유한한 숫자 expirationTime은 유지한다", () => {
        expect(serializePushSubscription(sub({ ...VALID, expirationTime: 1_700_000_000_000 }))?.expirationTime).toBe(
            1_700_000_000_000,
        );
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("null·undefined·toJSON 없는 객체는 null", () => {
        expect(serializePushSubscription(null)).toBeNull();
        expect(serializePushSubscription(undefined)).toBeNull();
        expect(serializePushSubscription({} as never)).toBeNull();
    });

    it("toJSON()이 throw하면 null", () => {
        expect(
            serializePushSubscription({
                toJSON: () => {
                    throw new Error("boom");
                },
            }),
        ).toBeNull();
    });

    it("keys가 없거나 한쪽만 있으면 null (부분 구현 WebView)", () => {
        expect(serializePushSubscription(sub({ endpoint: VALID.endpoint }))).toBeNull();
        expect(serializePushSubscription(sub({ ...VALID, keys: { p256dh: VALID.keys.p256dh } }))).toBeNull();
        expect(serializePushSubscription(sub({ ...VALID, keys: { p256dh: "", auth: VALID.keys.auth } }))).toBeNull();
    });

    it("NaN·Infinity·문자열 expirationTime은 null로 정규화", () => {
        expect(serializePushSubscription(sub({ ...VALID, expirationTime: Number.NaN }))?.expirationTime).toBeNull();
        expect(
            serializePushSubscription(sub({ ...VALID, expirationTime: Number.POSITIVE_INFINITY }))?.expirationTime,
        ).toBeNull();
        expect(serializePushSubscription(sub({ ...VALID, expirationTime: "1" }))?.expirationTime).toBeNull();
    });

    // ── 악성·오남용 (adversarial) ──

    it("https가 아닌 endpoint(http·javascript:·상대경로)는 null", () => {
        expect(serializePushSubscription(sub({ ...VALID, endpoint: "http://evil.example/push" }))).toBeNull();
        expect(serializePushSubscription(sub({ ...VALID, endpoint: "javascript:alert(1)" }))).toBeNull();
        expect(serializePushSubscription(sub({ ...VALID, endpoint: "/push" }))).toBeNull();
    });

    it("초장문 endpoint·key는 null", () => {
        expect(
            serializePushSubscription(sub({ ...VALID, endpoint: `https://a.example/${"x".repeat(3000)}` })),
        ).toBeNull();
        expect(
            serializePushSubscription(sub({ ...VALID, keys: { ...VALID.keys, auth: "A".repeat(1000) } })),
        ).toBeNull();
    });

    it("키에 base64 외 문자(HTML·공백)가 있으면 null", () => {
        expect(serializePushSubscription(sub({ ...VALID, keys: { ...VALID.keys, auth: "<script>" } }))).toBeNull();
        expect(serializePushSubscription(sub({ ...VALID, keys: { ...VALID.keys, auth: "a b" } }))).toBeNull();
    });

    it("추가 필드·__proto__ 키는 결과에 싣지 않는다", () => {
        const json = JSON.parse(
            `{"endpoint":"${VALID.endpoint}","expirationTime":null,"keys":{"p256dh":"${VALID.keys.p256dh}","auth":"${VALID.keys.auth}","__proto__":{"polluted":true}},"__proto__":{"polluted":true},"extra":"x"}`,
        );
        const result = serializePushSubscription(sub(json));
        expect(result).toEqual(VALID);
        expect(Object.keys(result ?? {})).toEqual(["endpoint", "expirationTime", "keys"]);
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
});
