# Checkbox — Radix 1:1 parity

## 격차 항목 (메움)
- [x] **BubbleInput 통합** (indeterminate 지원 포함) — form bubbling
- [x] **isFormControl 감지**
- [x] **Enter 키 preventDefault** — WAI-ARIA 따라 체크박스는 Enter로 토글 안 함
- [x] **form reset 처리** — initial state 복원
- [x] **Indicator pointerEvents:none** 스타일 추가

## Radix 동등
- [x] role="checkbox"
- [x] aria-checked (mixed for indeterminate)
- [x] data-state checked/unchecked/indeterminate
- [x] CheckedState 타입 (boolean | 'indeterminate')

## 미구현 (낮은 우선순위)
- [ ] **CheckboxProvider / CheckboxTrigger 분리 패턴** — Radix v2의 새 API. 우리는 Root에 합쳐 둠. 외부 사용 동등.
- [ ] **Indicator Presence wrap** — 우리는 단순 conditional render. CSS animation 시 unmount 즉시.
