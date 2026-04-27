# RadioGroup — Radix 1:1 parity

## 메움 (Phase 2·3)
- [x] role="radiogroup", role="radio"
- [x] aria-checked, aria-required, aria-orientation
- [x] data-disabled
- [x] orientation horizontal / vertical
- [x] **RTL 키보드** (Phase 2)
- [x] keyboard nav: ArrowUp/Down/Left/Right
- [x] **Enter 차단** (Phase 3 추가) — WAI-ARIA
- [x] Indicator 서브컴포넌트
- [x] asChild on Item

## 미구현 (큰 격차, 별도 마일스톤)
- [ ] **BubbleInput per Item** — Radix는 각 Radio가 hidden `<input type="radio">`를 form 통합용으로 동반 렌더. 우리는 없음.
- [ ] **Auto-check on focus while arrow pressed** — 화살표 키로 이동 시 새 item 자동 체크. 우리 setValue는 이미 focus 변경 시 호출하지만, 화살표 vs 클릭 구분 안 함.
- [ ] **dir attribute on root** — Radix는 Root div에 dir prop 직접 전파. 우리는 useDirection만 사용.

## ToggleGroup과 같은 RovingFocus 패턴 사용 (외부 API 동등)
