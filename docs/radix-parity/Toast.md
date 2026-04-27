# Toast — Radix 1:1 parity

> 우리: 291줄 / Radix: 982줄. 외부 API는 일부 차이.

## 메움 (Phase 2)
- [x] role / data-state
- [x] swipe-to-dismiss (Phase 2 추가)
- [x] pause-on-hover (Phase 2 추가)
- [x] auto-close timeout

## 미메움 (큰 격차, 별도 마일스톤)
- [ ] **Toast.Provider** — `swipeDirection` / `swipeThreshold` / `duration` / `label` 그룹 공유 (Radix는 Provider 필수)
- [ ] **Toast.Viewport** — toast가 portal되는 region (`role="region" aria-label`)
- [ ] **announcer** — screen-reader 알림 (aria-live polite/assertive)
- [ ] **multiple toasts queue** — 여러 toast가 한 번에 떴을 때 stacking
- [ ] **`forceMount` on Action / Close**
- [ ] **`type` prop** — `'foreground' | 'background'` (announcer 동작 차이)
- [ ] **swipeStart / swipeMove / swipeEnd / swipeCancel callbacks**
- [ ] **dismiss timeout pause/resume**

Radix Toast는 매우 복잡한 announcer + queue + provider 시스템. 1:1 매칭은 신규 구현 가까움.
