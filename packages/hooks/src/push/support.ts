/**
 * Web Push 지원 여부 감지.
 *
 * - `supported`: 서비스워커·PushManager·Notification 표면이 모두 있음
 * - `ios-needs-install`: iOS/iPadOS 브라우저 탭 — 홈 화면에 추가한 PWA(16.4+)에서만 푸시 가능
 * - `unsupported`: 그 외 (SSR, 구형 브라우저, 부분 구현 WebView, 16.4 미만 iOS PWA)
 *
 * usePushSubscription이 실제로 호출하는 표면 전체를 확인한다 — 일부만 구현된 WebView에서
 * 구독 시도가 크래시하지 않도록.
 */
export type PushSupport = "supported" | "ios-needs-install" | "unsupported";

function hasPushSurface(): boolean {
    const w = window as unknown as Record<string, unknown>;
    const sw = (navigator as unknown as Record<string, unknown>).serviceWorker;
    if (typeof sw !== "object" || sw === null) return false;
    if (typeof (sw as Record<string, unknown>).getRegistration !== "function") return false;
    if (typeof w.PushManager !== "function") return false;
    const N = w.Notification;
    if (typeof N !== "function") return false;
    return typeof (N as unknown as Record<string, unknown>).requestPermission === "function";
}

function isIos(): boolean {
    const ua = typeof navigator.userAgent === "string" ? navigator.userAgent : "";
    if (/iPhone|iPad|iPod/.test(ua)) return true;
    // iPadOS 13+ 는 데스크톱(Macintosh) UA를 쓴다 — 터치 포인트로 구분
    return /Macintosh/.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
}

function isStandalone(): boolean {
    if ((navigator as unknown as Record<string, unknown>).standalone === true) return true;
    return typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches;
}

export function getPushSupport(): PushSupport {
    if (typeof window === "undefined" || typeof navigator === "undefined") return "unsupported";
    if (hasPushSurface()) return "supported";
    return isIos() && !isStandalone() ? "ios-needs-install" : "unsupported";
}
