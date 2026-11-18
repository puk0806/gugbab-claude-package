import { urlBase64ToUint8Array } from "./url-base64-to-uint8-array";

/** 압축되지 않은 P-256 공개키 길이 (0x04 + X 32바이트 + Y 32바이트) */
const UNCOMPRESSED_P256_LENGTH = 65;

/**
 * VAPID 공개키 형식 검증 — base64url 디코딩 결과가 65바이트이고 0x04로 시작하는지.
 *
 * 곡선 위의 점인지까지는 확인하지 않는다(브라우저 `subscribe()`가 최종 판정).
 * 비밀키(32바이트)를 공개키 자리에 넣는 흔한 실수를 구독 시도 전에 잡는 용도.
 */
export function isVapidPublicKey(key: unknown): key is string {
    if (typeof key !== "string" || key.length === 0 || key.length > 200) return false;
    try {
        const bytes = urlBase64ToUint8Array(key);
        return bytes.length === UNCOMPRESSED_P256_LENGTH && bytes[0] === 0x04;
    } catch {
        return false;
    }
}
