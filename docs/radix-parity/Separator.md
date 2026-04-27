# Separator — Radix 1:1 parity

> 비교 시점: 2026-04-27 / Radix HEAD

## 격차 항목
- [ ] **`aria-orientation` 출력 조건**: Radix는 `vertical`만 노출 (horizontal은 디폴트라 생략). 우리는 둘 다 노출. → `aria-orientation` only when vertical.
- [x] role/decorative — 동등
- [x] data-orientation — 동등
- [ ] **invalid orientation fallback**: Radix는 invalid 시 horizontal로. 우리는 type system으로 막음. 굳이 runtime check 안 해도 OK (skip).
