import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPushSupport } from "./support";

const IPHONE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari";
const MAC_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36";

function setNav(key: string, value: unknown) {
    Object.defineProperty(navigator, key, { value, configurable: true });
}

function installPushSurface() {
    setNav("serviceWorker", { getRegistration: vi.fn() });
    vi.stubGlobal("PushManager", class {});
    const N = Object.assign(class {}, { requestPermission: vi.fn(), permission: "default" });
    vi.stubGlobal("Notification", N);
}

function setStandalone(matches: boolean) {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: matches && q.includes("standalone") }));
}

describe("getPushSupport", () => {
    beforeEach(() => {
        setNav("userAgent", ANDROID_UA);
        setNav("maxTouchPoints", 0);
        setNav("standalone", undefined);
        setStandalone(false);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Reflect.deleteProperty(navigator, "serviceWorker");
        Reflect.deleteProperty(navigator, "userAgent");
        Reflect.deleteProperty(navigator, "maxTouchPoints");
        Reflect.deleteProperty(navigator, "standalone");
    });

    // ── 정상 (happy path) ──

    it("서비스워커·PushManager·Notification이 모두 있으면 supported", () => {
        installPushSurface();
        expect(getPushSupport()).toBe("supported");
    });

    it("iOS 홈 화면 PWA(16.4+)는 표면이 있으므로 supported", () => {
        setNav("userAgent", IPHONE_UA);
        setNav("standalone", true);
        installPushSurface();
        expect(getPushSupport()).toBe("supported");
    });

    // ── 경계·이상 경로 (edge/malformed) ──

    it("iPhone Safari 탭(표면 없음, standalone 아님)은 ios-needs-install", () => {
        setNav("userAgent", IPHONE_UA);
        expect(getPushSupport()).toBe("ios-needs-install");
    });

    it("iPadOS 데스크톱 UA + 터치는 iOS로 판정", () => {
        setNav("userAgent", MAC_UA);
        setNav("maxTouchPoints", 5);
        expect(getPushSupport()).toBe("ios-needs-install");
    });

    it("터치 없는 Mac Safari(구형, 표면 없음)는 unsupported", () => {
        setNav("userAgent", MAC_UA);
        expect(getPushSupport()).toBe("unsupported");
    });

    it("iOS PWA인데 표면이 없으면(16.4 미만) 설치 안내 대신 unsupported", () => {
        setNav("userAgent", IPHONE_UA);
        setStandalone(true);
        expect(getPushSupport()).toBe("unsupported");
    });

    // ── 악성·오남용 / 부분 구현 (adversarial) ──

    it("PushManager만 빠진 부분 구현 WebView는 unsupported", () => {
        installPushSurface();
        vi.stubGlobal("PushManager", undefined);
        expect(getPushSupport()).toBe("unsupported");
    });

    it("Notification.requestPermission이 함수가 아니면 unsupported", () => {
        installPushSurface();
        vi.stubGlobal("Notification", Object.assign(class {}, { requestPermission: "nope" }));
        expect(getPushSupport()).toBe("unsupported");
    });

    it("serviceWorker가 null이거나 getRegistration이 없으면 unsupported", () => {
        installPushSurface();
        setNav("serviceWorker", null);
        expect(getPushSupport()).toBe("unsupported");
        setNav("serviceWorker", {});
        expect(getPushSupport()).toBe("unsupported");
    });
});
