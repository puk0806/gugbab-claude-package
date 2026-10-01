---
"@gugbab/headless": minor
---

메뉴·호버카드 접근성과 ref 안정성

- HoverCard: Content에 `role="dialog"`를 붙이지 않습니다(Radix와 동일). 호버 카드는 이미 접근 가능한 링크의 미리보기라서, 이름 없는 dialog는 스크린 리더에 빈 대화상자로 읽혔습니다. 트리거의 `aria-haspopup`·`aria-expanded`·`aria-controls`도 함께 사라집니다.
- ContextMenu: 트리거 영역(일반 `div`)에 허용되지 않는 `aria-expanded`·`aria-haspopup`·`aria-controls`를 렌더링하지 않습니다.
- Menubar: 트리거에 `role="menuitem"`을 지정합니다. `menubar`의 자식은 메뉴 항목이어야 합니다(WAI-ARIA).
- Accordion.Header: `level` prop(1–6, 기본 3)으로 제목 수준을 문서 구조에 맞출 수 있습니다. `AccordionHeaderProps`·`AccordionTriggerProps`·`AccordionContentProps` 타입을 export합니다.
- Toast: `Toast.Provider`의 `closeLabel`(기본 `'Close'`)로 아이콘 전용 닫기 버튼의 이름을 현지화합니다. 버튼에 직접 준 `aria-label`이 우선합니다. `aria-label={undefined}`를 넘기면 기본 이름이 사라지던 문제도 고쳤습니다.
- Tooltip·HoverCard·Menubar·ContextMenu·Select·Combobox·Slider·Toast·OneTimePasswordField·Accordion·Collapsible·ScrollArea: 부모가 다시 렌더링될 때마다 전달한 ref가 `null` → 노드로 재호출되던 문제를 고쳤습니다(ref 병합 안정화).
