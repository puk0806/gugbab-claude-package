# Switch — Radix 1:1 parity

## 격차 항목 (메움)
- [x] **BubbleInput 통합** — form 내부일 때 hidden `<input type="checkbox">` 동반 렌더, native form change event bubbling
- [x] **isFormControl 감지** — `form` prop 또는 `closest('form')`
- [x] **stopPropagation 로직** — button click이 form까지 두 번 propagate 안 되게
- [x] **`form` prop 지원**
- [x] **form reset 처리** — initial state 복원

## Radix 동등
- [x] role="switch"
- [x] aria-checked, aria-required
- [x] data-state checked/unchecked
- [x] Thumb 서브컴포넌트

## 우리에게 추가된 것
- `asChild` (Phase 2)
