---
"@gugbab/hooks": patch
"@gugbab/headless": minor
---

접근성·동작 버그 수정 (WAI-ARIA APG 기준)

- `useControllableState`: StrictMode에서 `onChange`가 두 번 호출되던 문제 수정. 이 훅을 쓰는 모든 컴포넌트의 `onValueChange`·`onOpenChange` 등에 영향.
- Combobox: 재오픈·필터링 시 항목 목록이 누적되던 문제 수정. **Enter 키로 활성 항목 선택** 지원 추가(IME 조합 중 Enter는 무시). 활성 항목에 `data-highlighted` 속성 노출 — 스타일에서 키보드 하이라이트에 사용.
- RovingFocusGroup: 컨테이너의 `tabindex`가 `0` → `-1`로 바뀌어, Tabs·RadioGroup·Toolbar·Accordion 등에서 Tab이 두 번 멈추던 문제 해결. 컨테이너 탭 스톱에 의존하던 테스트가 있다면 갱신 필요.
- Slider: 가로형에서 ArrowUp은 증가, ArrowDown은 감소(RTL·`inverted`와 무관). 이 키에서 `preventDefault`가 호출되어 더 이상 페이지가 스크롤되지 않음.
