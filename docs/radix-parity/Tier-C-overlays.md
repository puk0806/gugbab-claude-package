# Tier C overlays — Radix 1:1 parity (일괄)

## 메움 (Phase 3 이번 세션)
모든 Tier C overlay에 동일 패턴 일괄 적용:
- [x] **`contentId`** + Trigger의 `aria-controls={contentId}` + Content의 `id={contentId}`
  - Dialog / Popover / DropdownMenu / ContextMenu (자동 → Menubar 위임)
  - HoverCard
- [x] **Tooltip Trigger의 `aria-describedby={contentId}` (open 시)**
- [x] **Portal `forceMount` / `container` props** — 모든 overlay (Dialog/Popover/HoverCard/Tooltip/DropdownMenu/ContextMenu)
- [x] **Tooltip.Provider** 패턴 — `delayDuration` / `skipDelayDuration` / `disableHoverableContent` 그룹 공유

## 미메움 (DismissableLayer wrapper 인프라 필요 — 별도 마일스톤)
- [ ] onPointerDownOutside / onFocusOutside / onInteractOutside / onEscapeKeyDown
- [ ] onCloseAutoFocus / onOpenAutoFocus
- [ ] aria-hidden hideOthers (modal Dialog의 다른 요소 접근성 처리)
- [ ] Title 누락 시 dev console.error 경고

## 동등 (이미)
- [x] role / asChild / data-state / placement / modal / Trigger·Content·Close 모든 sub
- [x] Sub menus (이번 세션 추가)
- [x] CheckboxItem / RadioGroup / RadioItem / ItemIndicator
