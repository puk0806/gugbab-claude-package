const BASE64URL_PATTERN = /^[A-Za-z0-9_-]*={0,2}$/;

/**
 * base64url(또는 표준 base64) 문자열을 바이트 배열로 디코딩한다.
 *
 * Web Push `applicationServerKey`(VAPID 공개키) 변환용. `-`/`_`를 `+`/`/`로 바꾸고
 * 패딩을 보충한 뒤 `atob`로 디코딩한다 (브라우저·Node 16+ 모두 전역 제공).
 *
 * @throws TypeError — 허용 문자 외 입력, 길이 % 4 === 1 같은 디코딩 불가 입력
 */
export function urlBase64ToUint8Array(input: string): Uint8Array<ArrayBuffer> {
    if (typeof input !== "string") throw new TypeError("base64url 문자열이 아닙니다");
    const trimmed = input.trim();
    const normalized = trimmed.replace(/\+/g, "-").replace(/\//g, "_");
    if (!BASE64URL_PATTERN.test(normalized)) throw new TypeError("base64url 허용 문자가 아닙니다");

    const body = normalized.replace(/=+$/, "");
    if (body.length % 4 === 1) throw new TypeError("base64url 길이가 올바르지 않습니다");

    const padded = body + "=".repeat((4 - (body.length % 4)) % 4);
    const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
