# Select — Radix 1:1 parity

## 메움 (Phase 2 + 3)
- [x] FloatingList + useListItem (DOM-order 자동)
- [x] useTypeahead (typeahead)
- [x] role="listbox" / "option"
- [x] aria-selected / aria-haspopup / aria-expanded / aria-controls
- [x] data-state / data-disabled / data-value
- [x] usePresence on Content
- [x] asChild on Trigger / Item
- [x] Value placeholder

## 미메움 (큰 격차)
- [ ] **ScrollUpButton / ScrollDownButton** — Radix는 listbox 위/아래에 자동 스크롤 버튼 (long list)
- [ ] **virtualized 옵션** — 매우 긴 list 성능
- [ ] **selected option auto-scroll into view** on open
- [ ] **`required` prop** — form 통합
- [ ] **BubbleInput / form sync** — Radix는 hidden `<select>` 동반
- [ ] **Group / Label** — 우리에게 일부 있지만 ARIA labelling 불완전
- [ ] **Native Select fallback** — Radix의 mobile에서 native picker 사용
- [ ] **Position-aware Content placement** (`position: 'item-aligned' | 'popper'`)
