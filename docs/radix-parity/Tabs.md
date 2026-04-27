# Tabs — Radix 1:1 parity

## 메움 (Phase 1·2·3)
- [x] role="tablist", "tab", "tabpanel"
- [x] aria-selected, aria-controls, tabIndex roving
- [x] activationMode automatic / manual
- [x] orientation horizontal / vertical
- [x] **RTL 키보드** (Phase 2)
- [x] data-state active/inactive
- [x] data-orientation
- [x] Home/End 키 (Phase 1 이전부터)
- [x] asChild on Trigger
- [x] forceMount on Content
- [x] hidden on Content (when not selected)

## 차이 (외부 API 동등, 내부 구현)
- [ ] **RovingFocus 패턴 추출**: Radix는 `@radix-ui/react-roving-focus`로 분리. 우리는 Tabs 내부에 키보드 핸들러 직접. 외부 동작 동등.
