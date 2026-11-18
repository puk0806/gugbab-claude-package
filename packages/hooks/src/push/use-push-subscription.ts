import type { SerializedPushSubscription } from "@gugbab/utils";
import { isVapidPublicKey, serializePushSubscription, urlBase64ToUint8Array } from "@gugbab/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PushSupport } from "./support";
import { getPushSupport } from "./support";

/** 실패 분류 — 사용자에게 보일 문구는 앱이 정한다 */
export type PushError =
    | "unsupported"
    | "ios-needs-install"
    | "invalid-key"
    | "permission-denied"
    | "permission-dismissed"
    | "no-service-worker"
    | "subscribe-failed"
    | "unsubscribe-failed"
    | "sync-failed";

export type PushPermission = NotificationPermission | "unknown";

/** `loading`: 마운트 후 첫 판정 전 (SSR·첫 렌더 포함) */
export type PushStatus = "loading" | "idle" | "subscribing" | "unsubscribing";

export interface UsePushSubscriptionOptions {
    /** VAPID 공개키 (base64url). 비밀키를 넣으면 `invalid-key` */
    vapidPublicKey: string;
    /**
     * 서비스워커 등록을 돌려주는 함수. 기본은 `navigator.serviceWorker.getRegistration()`
     * (등록 전이면 undefined → `no-service-worker`). 등록 완료까지 기다리려면
     * `() => navigator.serviceWorker.ready`를 넘긴다.
     */
    getRegistration?: () => Promise<ServiceWorkerRegistration | undefined>;
    /** 새 구독(또는 기존 구독 재사용)을 서버에 저장. throw하면 `sync-failed` — 새로 만든 구독은 되돌린다 */
    onSubscribe?: (subscription: SerializedPushSubscription) => void | Promise<void>;
    /** 브라우저 구독 해지 후 서버에서 삭제. throw하면 `sync-failed` (브라우저 쪽은 이미 해지됨) */
    onUnsubscribe?: (subscription: SerializedPushSubscription) => void | Promise<void>;
}

export interface UsePushSubscriptionReturn {
    /** 마운트 전 null */
    readonly support: PushSupport | null;
    readonly permission: PushPermission;
    /** 현재 브라우저 구독 (서버 전송 형식) */
    readonly subscription: SerializedPushSubscription | null;
    readonly status: PushStatus;
    readonly error: PushError | null;
    /** 권한 요청 → 구독 → onSubscribe. 반드시 탭·클릭 핸들러 안에서 호출 (iOS 요구). 진행 중이면 false */
    readonly subscribe: () => Promise<boolean>;
    /** 브라우저 구독 해지 → onUnsubscribe. 진행 중이면 false */
    readonly unsubscribe: () => Promise<boolean>;
    /** 권한·구독 상태 다시 읽기 (앱 복귀 시 등) */
    readonly refresh: () => Promise<void>;
}

function defaultGetRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    return navigator.serviceWorker.getRegistration();
}

function readPermission(): PushPermission {
    const p = typeof Notification === "undefined" ? undefined : Notification.permission;
    return p === "granted" || p === "denied" || p === "default" ? p : "unknown";
}

/** 프로미스·콜백 방식(구형 Safari) 모두 지원. 반드시 동기적으로 시작돼야 사용자 제스처가 유지된다 */
function requestPermission(): Promise<NotificationPermission> {
    return new Promise((resolve) => {
        let settled = false;
        const done = (p: NotificationPermission) => {
            if (settled) return;
            settled = true;
            resolve(p);
        };
        try {
            const maybe: unknown = Notification.requestPermission(done);
            if (maybe && typeof (maybe as Promise<NotificationPermission>).then === "function") {
                (maybe as Promise<NotificationPermission>).then(done, () => done("default"));
            }
        } catch {
            done("default");
        }
    });
}

function sameKey(existing: PushSubscription, key: Uint8Array): boolean {
    const current = existing.options?.applicationServerKey;
    if (!current) return true; // 읽을 수 없으면 재사용 (브라우저가 최종 판정)
    const bytes = new Uint8Array(current);
    if (bytes.length !== key.length) return false;
    for (let i = 0; i < bytes.length; i++) if (bytes[i] !== key[i]) return false;
    return true;
}

async function getPushManager(get: () => Promise<ServiceWorkerRegistration | undefined>): Promise<PushManager | null> {
    try {
        const reg = await get();
        return reg && typeof reg.pushManager === "object" && reg.pushManager !== null ? reg.pushManager : null;
    } catch {
        return null;
    }
}

/**
 * Web Push 구독 React 훅 (브라우저 쪽만). 서버 발송·서비스워커 스크립트는 앱 몫.
 *
 * - 권한 요청은 subscribe() 안에서 첫 비동기 작업 전에 동기 호출 — iOS 사용자 제스처 유지
 * - 구독/해지는 한 번에 하나만 (중복 탭 방어), 언마운트 후 상태 갱신 안 함
 * - VAPID 키가 바뀌었으면 기존 구독을 해지하고 새로 구독
 * - 서버 저장(onSubscribe) 실패 시 새로 만든 구독을 되돌려 브라우저·서버 상태를 맞춘다
 */
export function usePushSubscription(options: UsePushSubscriptionOptions): UsePushSubscriptionReturn {
    const [support, setSupport] = useState<PushSupport | null>(null);
    const [permission, setPermission] = useState<PushPermission>("unknown");
    const [subscription, setSubscription] = useState<SerializedPushSubscription | null>(null);
    const [status, setStatus] = useState<PushStatus>("loading");
    const [error, setError] = useState<PushError | null>(null);

    // 최신 옵션 — 콜백 정체성이 바뀌어도 subscribe/unsubscribe를 다시 만들지 않는다
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const aliveRef = useRef(true);
    const busyRef = useRef(false);
    // 구독/해지/새로고침마다 증가 — 오래된 refresh 결과가 최신 상태를 덮지 않게
    const genRef = useRef(0);

    const getReg = useCallback(() => (optionsRef.current.getRegistration ?? defaultGetRegistration)(), []);

    const fail = useCallback((e: PushError): false => {
        if (aliveRef.current) setError(e);
        return false;
    }, []);

    const refresh = useCallback(async () => {
        const gen = ++genRef.current;
        const sup = getPushSupport();
        if (!aliveRef.current) return;
        setSupport(sup);
        if (sup !== "supported") {
            setStatus((s) => (s === "loading" ? "idle" : s));
            return;
        }
        setPermission(readPermission());
        const pm = await getPushManager(getReg);
        let current: PushSubscription | null = null;
        if (pm) {
            try {
                current = await pm.getSubscription();
            } catch {
                current = null;
            }
        }
        if (!aliveRef.current || gen !== genRef.current) return;
        setSubscription(serializePushSubscription(current));
        setStatus((s) => (s === "loading" ? "idle" : s));
    }, [getReg]);

    useEffect(() => {
        aliveRef.current = true;
        void refresh();
        return () => {
            aliveRef.current = false;
        };
    }, [refresh]);

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (busyRef.current) return false;
        const sup = getPushSupport();
        if (sup !== "supported") return fail(sup);
        const { vapidPublicKey } = optionsRef.current;
        if (!isVapidPublicKey(vapidPublicKey)) return fail("invalid-key");
        const key = urlBase64ToUint8Array(vapidPublicKey);

        busyRef.current = true;
        genRef.current++;
        // 첫 await 전에 동기 호출 — 사용자 제스처 안에서 권한 창을 띄운다
        const permissionPromise =
            readPermission() === "granted" ? Promise.resolve<NotificationPermission>("granted") : requestPermission();
        setError(null);
        setStatus("subscribing");
        try {
            const perm = await permissionPromise;
            if (aliveRef.current) setPermission(perm);
            if (perm === "denied") return fail("permission-denied");
            if (perm !== "granted") return fail("permission-dismissed");

            const pm = await getPushManager(getReg);
            if (!pm) return fail("no-service-worker");

            let existing: PushSubscription | null = null;
            try {
                existing = await pm.getSubscription();
            } catch {
                existing = null;
            }
            if (existing && !sameKey(existing, key)) {
                try {
                    await existing.unsubscribe();
                } catch {
                    // 해지 실패 시 아래 subscribe가 InvalidStateError로 실패 → subscribe-failed
                }
                existing = null;
            }

            const created = existing === null;
            let sub: PushSubscription;
            try {
                sub = existing ?? (await pm.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
            } catch {
                return fail("subscribe-failed");
            }

            const serialized = serializePushSubscription(sub);
            if (!serialized) {
                if (created) await sub.unsubscribe().catch(() => false);
                return fail("subscribe-failed");
            }

            try {
                await optionsRef.current.onSubscribe?.(serialized);
            } catch {
                if (created) {
                    await sub.unsubscribe().catch(() => false);
                } else if (aliveRef.current) {
                    setSubscription(serialized);
                }
                return fail("sync-failed");
            }

            if (aliveRef.current) setSubscription(serialized);
            return true;
        } finally {
            busyRef.current = false;
            if (aliveRef.current) setStatus("idle");
        }
    }, [fail, getReg]);

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (busyRef.current) return false;
        const sup = getPushSupport();
        if (sup !== "supported") return fail(sup);

        busyRef.current = true;
        genRef.current++;
        setError(null);
        setStatus("unsubscribing");
        try {
            const pm = await getPushManager(getReg);
            if (!pm) return fail("no-service-worker");

            let sub: PushSubscription | null;
            try {
                sub = await pm.getSubscription();
            } catch {
                return fail("unsubscribe-failed");
            }
            if (!sub) {
                if (aliveRef.current) setSubscription(null);
                return true;
            }

            const serialized = serializePushSubscription(sub);
            let ok = false;
            try {
                ok = await sub.unsubscribe();
            } catch {
                ok = false;
            }
            if (!ok) return fail("unsubscribe-failed");
            if (aliveRef.current) setSubscription(null);

            if (serialized) {
                try {
                    await optionsRef.current.onUnsubscribe?.(serialized);
                } catch {
                    return fail("sync-failed");
                }
            }
            return true;
        } finally {
            busyRef.current = false;
            if (aliveRef.current) setStatus("idle");
        }
    }, [fail, getReg]);

    return { support, permission, subscription, status, error, subscribe, unsubscribe, refresh };
}
