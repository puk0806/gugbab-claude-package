# Collapsible — Radix 1:1 parity

## 메움 (Phase 2)
- [x] asChild on Trigger
- [x] usePresence on Content (data-state="open|closed", animation-aware unmount)

## 메움 (Phase 3)
- [x] data-disabled on Trigger
- [x] data-state on Trigger / Content
- [x] forceMount

## 미해결 (큰 격차, 별도 작업 필요)
- [ ] **CSS variables `--radix-collapsible-content-height/width`** — Radix는 ResizeObserver + getBoundingClientRect로 측정, animation 일시 차단 후 측정, 측정 후 복원. 사용자가 CSS animation 적용 시 height/width 변수로 부드러운 expand/collapse 가능.
- [ ] **mount animation prevention** — 첫 마운트 시 animation 끄기 (requestAnimationFrame 1프레임)
- [ ] **isPresent 동기화** — Presence가 외부 제어, 내부 isPresent로 측정 타이밍 맞춤

이 부분은 ResizeObserver + 애니메이션 정확한 측정이 들어가서 별도 작업으로 분리. 핵심 동작은 이미 동등.
