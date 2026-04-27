# Slider — Radix 1:1 parity

> 우리: 313줄 / Radix: 810줄. 외부 API 동등하지만 내부 디테일·엣지 케이스 격차 존재.

## 메움 (Phase 2)
- [x] role="slider" / aria-valuemin/max/now / aria-orientation
- [x] keyboard ArrowUp/Down/Left/Right (RTL 일부)
- [x] data-state / data-orientation
- [x] pointer drag (Phase 2 추가)
- [x] onValueCommit
- [x] step prop

## 미메움 (큰 격차, 별도 마일스톤)
- [ ] **BubbleInput per Thumb** — Radix는 각 thumb에 hidden `<input>` 동반 (form 통합). 우리는 없음.
- [ ] **Range (multi-thumb)** — Radix는 `value: number[]` 기반 다중 thumb 지원. 우리는 단일 thumb 가정 일부.
- [ ] **`inverted` prop** — slider 방향 반전
- [ ] **`minStepsBetweenThumbs`** — multi-thumb 시 thumb 간 최소 거리
- [ ] **disabled 시 모든 인터랙션 차단**
- [ ] **Track click** — track 클릭 시 가까운 thumb이 점프
- [ ] **Home/End/PageUp/PageDown 키**
- [ ] **dir prop으로 RTL** (Phase 2에서 일부 적용)
