# Label — Radix 1:1 parity

> 비교 시점: 2026-04-27 / Radix HEAD

## 격차 항목
- [ ] **interactive 자식 클릭 시 onMouseDown 호출 순서**: Radix는 interactive 자식 (button/input/select/textarea) 클릭 시 `early return` → `props.onMouseDown` 호출 안 함. 우리는 항상 호출. → Radix 순서로 수정.

## Radix와 동등
- [x] `<label>` 기반
- [x] event.detail > 1 시 preventDefault (double-click 선택 방지)
