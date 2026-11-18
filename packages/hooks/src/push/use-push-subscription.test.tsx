import { urlBase64ToUint8Array } from "@gugbab/utils";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePushSubscription } from "./use-push-subscription";

// 테스트 전용 P-256 키 (실서비스 키 아님)
const VAPID = "BLeVBuFmLkmVtoKZEUfw2ewrOFZmDUpCuFKPav4b2kWx1PK6NlllBQrSLYGrSjZ43wwT-bcE989M4cx6u9zaM-I";
const OTHER_VAPID = "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM";
const PRIVATE_KEY = "DGW-W_O1mQjSau6R7axmTnNAjl0v0-pykIivIuenET0";

const KEYS = { p256dh: OTHER_VAPID, auth: "tBHItJI5svbpez7KI4CCXg" };

interface FakeSub {
    endpoint: string;
    options: { applicationServerKey: ArrayBuffer | null };
    toJSON: () => unknown;
    unsubscribe: ReturnType<typeof vi.fn>;
}

function fakeSub(endpoint = "https://push.example/abc", key = VAPID): FakeSub {
    return {
        endpoint,
        options: { applicationServerKey: urlBase64ToUint8Array(key).buffer },
        toJSON: () => ({ endpoint, expirationTime: null, keys: KEYS }),
        unsubscribe: vi.fn(async () => true),
    };
}

let current: FakeSub | null;
let permission: NotificationPermission;
const requestPermission = vi.fn<() => Promise<NotificationPermission>>();
const pushManager = {
    getSubscription: vi.fn(async () => current),
    subscribe: vi.fn(async () => {
        current = fakeSub();
        return current;
    }),
};
const getRegistration = vi.fn(async () => ({ pushManager }));

function setup() {
    Object.defineProperty(navigator, "serviceWorker", { value: { getRegistration }, configurable: true });
    vi.stubGlobal("PushManager", class {});
    const N = Object.assign(class {}, { requestPermission });
    Object.defineProperty(N, "permission", { get: () => permission, configurable: true });
    vi.stubGlobal("Notification", N);
}

async function mount(opts: Partial<Parameters<typeof usePushSubscription>[0]> = {}) {
    const hook = renderHook(() => usePushSubscription({ vapidPublicKey: VAPID, ...opts }));
    await waitFor(() => expect(hook.result.current.status).toBe("idle"));
    return hook;
}

describe("usePushSubscription", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        current = null;
        permission = "default";
        requestPermission.mockImplementation(async () => {
            permission = "granted";
            return "granted";
        });
        setup();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Reflect.deleteProperty(navigator, "serviceWorker");
    });

    // ── 정상 (happy path) ──

    it("마운트 후 support·permission·기존 구독을 읽는다", async () => {
        current = fakeSub();
        permission = "granted";
        const { result } = await mount();
        expect(result.current.support).toBe("supported");
        expect(result.current.permission).toBe("granted");
        expect(result.current.subscription?.endpoint).toBe("https://push.example/abc");
    });

    it("subscribe(): 권한 요청 → 구독 → onSubscribe 호출", async () => {
        const onSubscribe = vi.fn();
        const { result } = await mount({ onSubscribe });
        let ok = false;
        await act(async () => {
            ok = await result.current.subscribe();
        });
        expect(ok).toBe(true);
        expect(requestPermission).toHaveBeenCalledTimes(1);
        expect(pushManager.subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }));
        expect(onSubscribe).toHaveBeenCalledWith({
            endpoint: "https://push.example/abc",
            expirationTime: null,
            keys: KEYS,
        });
        expect(result.current.subscription?.endpoint).toBe("https://push.example/abc");
        expect(result.current.permission).toBe("granted");
        expect(result.current.error).toBeNull();
    });

    it("권한 요청은 첫 await 전에 동기적으로 시작된다 (iOS 사용자 제스처)", async () => {
        const { result } = await mount();
        act(() => {
            void result.current.subscribe();
            // subscribe()를 호출한 같은 틱 안에서 이미 호출돼 있어야 한다
            expect(requestPermission).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => expect(result.current.status).toBe("idle"));
    });

    it("이미 granted면 권한 창을 다시 띄우지 않는다", async () => {
        permission = "granted";
        const { result } = await mount();
        await act(async () => {
            await result.current.subscribe();
        });
        expect(requestPermission).not.toHaveBeenCalled();
    });

    it("같은 키의 기존 구독은 재사용하고 서버에 다시 알린다", async () => {
        current = fakeSub();
        permission = "granted";
        const onSubscribe = vi.fn();
        const { result } = await mount({ onSubscribe });
        await act(async () => {
            await result.current.subscribe();
        });
        expect(pushManager.subscribe).not.toHaveBeenCalled();
        expect(onSubscribe).toHaveBeenCalledTimes(1);
    });

    it("unsubscribe(): 브라우저 해지 → onUnsubscribe 호출", async () => {
        current = fakeSub();
        permission = "granted";
        const sub = current;
        const onUnsubscribe = vi.fn();
        const { result } = await mount({ onUnsubscribe });
        let ok = false;
        await act(async () => {
            ok = await result.current.unsubscribe();
        });
        expect(ok).toBe(true);
        expect(sub.unsubscribe).toHaveBeenCalled();
        expect(onUnsubscribe).toHaveBeenCalledWith(expect.objectContaining({ endpoint: sub.endpoint }));
        expect(result.current.subscription).toBeNull();
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("권한 거부 → permission-denied, 구독 시도 안 함", async () => {
        requestPermission.mockResolvedValue("denied");
        const { result } = await mount();
        let ok = true;
        await act(async () => {
            ok = await result.current.subscribe();
        });
        expect(ok).toBe(false);
        expect(result.current.error).toBe("permission-denied");
        expect(result.current.permission).toBe("denied");
        expect(pushManager.subscribe).not.toHaveBeenCalled();
    });

    it("권한 창을 닫음(default) → permission-dismissed", async () => {
        requestPermission.mockResolvedValue("default");
        const { result } = await mount();
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("permission-dismissed");
    });

    it("구형 Safari 콜백 방식 requestPermission도 처리한다", async () => {
        requestPermission.mockImplementation(((cb: (p: NotificationPermission) => void) => {
            cb("granted");
            return undefined;
        }) as never);
        const { result } = await mount();
        let ok = false;
        await act(async () => {
            ok = await result.current.subscribe();
        });
        expect(ok).toBe(true);
    });

    it("서비스워커 등록이 없으면 no-service-worker", async () => {
        getRegistration.mockResolvedValueOnce(undefined as never).mockResolvedValueOnce(undefined as never);
        const { result } = await mount();
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("no-service-worker");
    });

    it("pushManager.subscribe가 throw하면 subscribe-failed", async () => {
        pushManager.subscribe.mockRejectedValueOnce(new Error("AbortError"));
        const { result } = await mount();
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("subscribe-failed");
        expect(result.current.subscription).toBeNull();
    });

    it("VAPID 키가 바뀌었으면 기존 구독을 해지하고 새로 구독한다", async () => {
        current = fakeSub("https://push.example/old", OTHER_VAPID);
        const old = current;
        permission = "granted";
        const { result } = await mount();
        await act(async () => {
            await result.current.subscribe();
        });
        expect(old.unsubscribe).toHaveBeenCalled();
        expect(pushManager.subscribe).toHaveBeenCalled();
    });

    it("onSubscribe 실패 시 새로 만든 구독을 되돌리고 sync-failed", async () => {
        const onSubscribe = vi.fn().mockRejectedValue(new Error("500"));
        const { result } = await mount({ onSubscribe });
        let ok = true;
        await act(async () => {
            ok = await result.current.subscribe();
        });
        expect(ok).toBe(false);
        expect(result.current.error).toBe("sync-failed");
        expect(current?.unsubscribe).toHaveBeenCalled();
        expect(result.current.subscription).toBeNull();
    });

    it("onSubscribe 실패 시 기존 구독은 해지하지 않는다", async () => {
        current = fakeSub();
        permission = "granted";
        const sub = current;
        const onSubscribe = vi.fn().mockRejectedValue(new Error("500"));
        const { result } = await mount({ onSubscribe });
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("sync-failed");
        expect(sub.unsubscribe).not.toHaveBeenCalled();
        expect(result.current.subscription?.endpoint).toBe(sub.endpoint);
    });

    it("구독이 없을 때 unsubscribe()는 성공으로 끝난다", async () => {
        const onUnsubscribe = vi.fn();
        const { result } = await mount({ onUnsubscribe });
        let ok = false;
        await act(async () => {
            ok = await result.current.unsubscribe();
        });
        expect(ok).toBe(true);
        expect(onUnsubscribe).not.toHaveBeenCalled();
    });

    it("브라우저 해지가 false를 돌려주면 unsubscribe-failed, 서버 삭제 안 함", async () => {
        current = fakeSub();
        current.unsubscribe.mockResolvedValue(false);
        permission = "granted";
        const onUnsubscribe = vi.fn();
        const { result } = await mount({ onUnsubscribe });
        await act(async () => {
            await result.current.unsubscribe();
        });
        expect(result.current.error).toBe("unsubscribe-failed");
        expect(onUnsubscribe).not.toHaveBeenCalled();
    });

    it("onUnsubscribe 실패 → sync-failed, 브라우저 구독은 이미 null", async () => {
        current = fakeSub();
        permission = "granted";
        const onUnsubscribe = vi.fn().mockRejectedValue(new Error("500"));
        const { result } = await mount({ onUnsubscribe });
        let ok = true;
        await act(async () => {
            ok = await result.current.unsubscribe();
        });
        expect(ok).toBe(false);
        expect(result.current.error).toBe("sync-failed");
        expect(result.current.subscription).toBeNull();
    });

    it("미지원 환경 → support=unsupported, subscribe()는 unsupported 에러", async () => {
        vi.stubGlobal("PushManager", undefined);
        const { result } = await mount();
        expect(result.current.support).toBe("unsupported");
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("unsupported");
        expect(requestPermission).not.toHaveBeenCalled();
    });

    // ── 악성·오남용 (adversarial) ──

    it("비밀키를 공개키 자리에 넣으면 권한 창 없이 invalid-key", async () => {
        const { result } = await mount({ vapidPublicKey: PRIVATE_KEY });
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("invalid-key");
        expect(requestPermission).not.toHaveBeenCalled();
    });

    it("빈 키·HTML 페이로드 키 → invalid-key", async () => {
        for (const key of ["", "<script>alert(1)</script>"]) {
            const { result, unmount } = await mount({ vapidPublicKey: key });
            await act(async () => {
                await result.current.subscribe();
            });
            expect(result.current.error).toBe("invalid-key");
            unmount();
        }
    });

    it("연속 탭(동시 subscribe 2회) → 두 번째는 false, 구독은 1번만", async () => {
        let release: (p: NotificationPermission) => void = () => {};
        requestPermission.mockImplementation(
            () =>
                new Promise((r) => {
                    release = r;
                }),
        );
        const { result } = await mount();
        let first: Promise<boolean> = Promise.resolve(false);
        let second = true;
        await act(async () => {
            first = result.current.subscribe();
            second = await result.current.subscribe();
        });
        expect(second).toBe(false);
        await act(async () => {
            release("granted");
            await first;
        });
        expect(await first).toBe(true);
        expect(pushManager.subscribe).toHaveBeenCalledTimes(1);
    });

    it("구독 중 unsubscribe() 호출은 무시(false)된다", async () => {
        let release: (p: NotificationPermission) => void = () => {};
        requestPermission.mockImplementation(
            () =>
                new Promise((r) => {
                    release = r;
                }),
        );
        const { result } = await mount();
        let first: Promise<boolean> = Promise.resolve(false);
        let un = true;
        await act(async () => {
            first = result.current.subscribe();
            un = await result.current.unsubscribe();
        });
        expect(un).toBe(false);
        await act(async () => {
            release("granted");
            await first;
        });
    });

    it("toJSON이 위조·깨진 구독이면 subscribe-failed + 되돌림", async () => {
        pushManager.subscribe.mockImplementationOnce(async () => {
            current = { ...fakeSub(), toJSON: () => ({ endpoint: "http://evil.example", keys: {} }) };
            return current;
        });
        const onSubscribe = vi.fn();
        const { result } = await mount({ onSubscribe });
        await act(async () => {
            await result.current.subscribe();
        });
        expect(result.current.error).toBe("subscribe-failed");
        expect(onSubscribe).not.toHaveBeenCalled();
        expect(current?.unsubscribe).toHaveBeenCalled();
    });

    it("진행 중 언마운트되어도 throw·경고 없이 끝난다", async () => {
        let release: (p: NotificationPermission) => void = () => {};
        requestPermission.mockImplementation(
            () =>
                new Promise((r) => {
                    release = r;
                }),
        );
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const { result, unmount } = await mount();
        let pending: Promise<boolean> = Promise.resolve(false);
        act(() => {
            pending = result.current.subscribe();
        });
        unmount();
        release("granted");
        await expect(pending).resolves.toBe(true);
        expect(errorSpy).not.toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it("getRegistration이 throw해도 마운트는 idle로 끝난다", async () => {
        getRegistration.mockRejectedValueOnce(new Error("SecurityError"));
        const { result } = await mount();
        expect(result.current.subscription).toBeNull();
        expect(result.current.error).toBeNull();
    });
});
