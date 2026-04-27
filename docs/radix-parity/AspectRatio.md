# AspectRatio — Radix 1:1 parity

> 비교 시점: 2026-04-27 / Radix HEAD

## 격차 항목
- [x] **레이아웃 구조** — outer wrapper(padding-bottom) + inner(absolute) 구조 매칭 (2026-04-27)
- [x] **ratio default** — `1 / 1` 매칭
- [x] **`data-aspect-ratio-wrapper` marker** — 추가 (radix prefix 제외)

## Radix와 동등한 부분
- [x] `ratio` prop
- [x] forwardRef
- [x] children 전달

## 구현 방향
Radix 구조 그대로 매칭 — outer wrapper + inner. Marker는 `data-aspect-ratio-wrapper`로 (radix prefix 제외).
