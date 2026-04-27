# NavigationMenu — Radix 1:1 parity

## 메움 (Phase 2)
- [x] Root + List + Item + Trigger + Content + Link + Indicator
- [x] keyboard navigation
- [x] role / aria attributes

## 미메움 (큰 격차)
- [ ] **Sub-content viewport positioning** — Radix는 hovered/active item 기준으로 sub viewport 배치
- [ ] **Indicator 정확한 정렬** — active item 위에 (Radix `data-radix-navigation-menu-indicator-position`)
- [ ] **delayDuration / skipDelayDuration** — Tooltip Provider처럼 그룹 공유
- [ ] **모션 헬퍼** — `data-motion="from-start" | "to-end"` 등 애니메이션 hint
- [ ] **dir prop으로 RTL**

NavigationMenu는 Radix 중에서도 가장 복잡한 컴포넌트 중 하나. 1:1 매칭은 신규 작성 가까움.
