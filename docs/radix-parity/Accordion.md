# Accordion — Radix 1:1 parity

> 비교 시점: 2026-04-27 / Radix `radix-ui/primitives` HEAD

## 격차 항목

### 핵심 동작
- [x] **Horizontal orientation 키보드** — 메움 (2026-04-27)
- [x] **Home/End 키** — 메움
- [x] **`dir` prop on Root + RTL 키보드** — 메움
- [x] **disabled accordion 전체 키보드 차단** — 메움
- [x] **`aria-disabled` on Trigger when (open && !collapsible)** — 메움

### 데이터 속성
- [x] **`data-orientation` on Root / Item / Header / Trigger / Content** — 메움

### CSS variable (애니메이션 지원)
- [ ] **`--radix-accordion-content-height/width` on Content style**: Collapsible Content가 컨테이너 크기 측정해서 CSS variable로 노출. 우리 Collapsible에도 없음 — 같이 추가해야 함.

### 컴포넌트 트리
- [ ] **AccordionItem이 Collapsible.Root를 내부에서 사용**: Radix는 Item이 Collapsible.Root 자체. 우리는 Accordion 자체 state로 처리. 구조 차이는 외부 API에 영향 없으나 `forceMount` 등 기능 누락 가능.

### 우리에게 이미 있고 동등한 것
- [x] Single / Multiple type
- [x] Controlled / Uncontrolled value
- [x] Disabled per-item / per-root
- [x] `data-state="open|closed"` on Item / Trigger / Content
- [x] `aria-controls`, `aria-expanded`, `aria-labelledby`, `id` 매핑
- [x] Collapsible single (collapsible: true)
- [x] asChild on Trigger (Phase 2 추가)
- [x] usePresence on Content (Phase 2 추가)

## 구현 우선순위
1. orientation/dir 키보드 (horizontal + RTL + Home/End) — UX 영향 큼
2. data-orientation 모든 subcomponent — CSS 셀렉터 의존
3. aria-disabled on locked trigger — 접근성
4. disabled root → 키보드 차단
5. CSS variable on Content (Collapsible 같이)
