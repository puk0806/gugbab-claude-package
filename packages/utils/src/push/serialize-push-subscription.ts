/** 서버로 보낼 구독 정보 — `web-push` 등 서버 라이브러리의 subscription 형식과 같다 */
export interface SerializedPushSubscription {
    readonly endpoint: string;
    readonly expirationTime: number | null;
    readonly keys: {
        readonly p256dh: string;
        readonly auth: string;
    };
}

/** `PushSubscription`의 직렬화에 필요한 최소 표면 (테스트·비표준 구현 대응) */
export interface PushSubscriptionLike {
    toJSON(): unknown;
}

const MAX_ENDPOINT_LENGTH = 2048;
const MAX_KEY_LENGTH = 512;
const KEY_PATTERN = /^[A-Za-z0-9_\-+/]+={0,2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isKey(value: unknown): value is string {
    return typeof value === "string" && value.length > 0 && value.length <= MAX_KEY_LENGTH && KEY_PATTERN.test(value);
}

function isHttpsEndpoint(value: unknown): value is string {
    if (typeof value !== "string" || value.length === 0 || value.length > MAX_ENDPOINT_LENGTH) return false;
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}

/**
 * `PushSubscription`을 서버 전송용 평범한 객체로 바꾼다.
 *
 * `toJSON()` 결과를 그대로 믿지 않고 endpoint(https URL)·keys(p256dh·auth) 형식을 검증한다.
 * 형식이 어긋나면(부분 구현 WebView, 위조 객체 등) `null` — 서버에 깨진 구독을 저장하지 않게.
 * 결과에는 알려진 필드만 담는다(추가 필드·프로토타입 오염 키는 버림).
 */
export function serializePushSubscription(
    subscription: PushSubscriptionLike | null | undefined,
): SerializedPushSubscription | null {
    if (!subscription || typeof subscription.toJSON !== "function") return null;

    let json: unknown;
    try {
        json = subscription.toJSON();
    } catch {
        return null;
    }
    if (!isRecord(json) || !isHttpsEndpoint(json.endpoint) || !isRecord(json.keys)) return null;

    const { p256dh, auth } = json.keys;
    if (!isKey(p256dh) || !isKey(auth)) return null;

    const exp = json.expirationTime;
    const expirationTime = typeof exp === "number" && Number.isFinite(exp) ? exp : null;

    return { endpoint: json.endpoint, expirationTime, keys: { p256dh, auth } };
}
