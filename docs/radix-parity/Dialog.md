# Dialog — Radix 1:1 parity

> 비교 시점: 2026-04-27 / Radix HEAD

## 메움 (Phase 2)
- [x] role="dialog" / "alertdialog"
- [x] aria-labelledby (titleId) / aria-describedby (descriptionId)
- [x] data-state open/closed
- [x] modal prop (FloatingFocusManager modal + scrollLock)
- [x] usePresence on Content
- [x] asChild on Trigger / Close / Title / Description / Content
- [x] Title / Description 컴포넌트로 ID 매핑

## 메움 (Phase 3 이번 세션)
- [x] **`contentId`** — context에 추가, Trigger에 `aria-controls={contentId}` 적용
- [x] **DialogPortal `forceMount` / `container`** — Radix와 동등 prop

## 미메움 (큰 격차, 별도 마일스톤)
- [ ] **`onOpenAutoFocus` / `onCloseAutoFocus`** — Radix Content props. floating-ui의 FloatingFocusManager는 initialFocus만 지원, callback 변환 필요
- [ ] **`onPointerDownOutside` / `onFocusOutside` / `onInteractOutside`** — Radix DismissableLayer props. floating-ui useDismiss는 onDismiss만 있어 분리 어려움. 우리만의 wrapper 필요
- [ ] **`aria-hidden` (hideOthers)** — modal 시 다른 요소 aria-hidden. 우리는 FloatingFocusManager modal로 일부만 처리
- [ ] **dev warning** — Title 누락 시 console.error
- [ ] **Trigger ref가 close 시 자동 focus** (Radix triggerRef로 명시 추적). floating-ui returnFocus={true}로 동등 처리됨

## 외부 API 동등성
거의 100% — Radix 사용자 코드가 그대로 작동 (asChild, modal, role, Title/Description). 콜백류만 미지원.
