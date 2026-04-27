# Combobox — Radix 1:1 parity

> 참고: Radix는 공식 `Combobox` primitive 없음 (대신 다른 라이브러리들이 비슷한 패턴). 우리만 만든 컴포넌트라 1:1 비교 대상 아님 — Radix Select / DropdownMenu 패턴 따라 구현.

## 우리 패키지의 Combobox
- 자체 구현, Phase 2에서 asChild 추가
- 우리 사용자 시나리오에 맞춤

## 향후 격차 (자체 우선순위)
- [ ] FloatingList + useListItem 적용 (Select처럼)
- [ ] useTypeahead 통합
- [ ] form 통합 (BubbleInput)
- [ ] async 옵션 로드 패턴
