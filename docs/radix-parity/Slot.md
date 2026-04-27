# Slot — Radix 1:1 parity

## 격차 항목 (메움)
- [x] **Slottable** 컴포넌트 추가 — children 중 어느 element를 slot 대상으로 쓸지 명시 (compound 패턴)
- [x] **Fragment safety** — element.type === Fragment일 때 ref 안 줌 (React 19 호환)
- [x] **multiple invalid children** 시 `Children.only(null)` throw → Radix 동등

## Radix와 동등 (이미)
- [x] forwardRef
- [x] mergeProps (className join, style merge, handler chain)
- [x] childRef + forwardedRef merge

## 미구현 / 차이
- [ ] **Lazy component support** (`React.use(promise)`) — 우리는 미지원. 사용 빈도 매우 낮아 보류.
- [ ] **mergeProps 순서**: Radix는 child handler가 result를 반환하면 그걸 반환. 우리는 무시. 영향 적음.
