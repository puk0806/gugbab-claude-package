---
"@gugbab/headless": minor
"@gugbab/hooks": patch
---

동작·접근성·성능 후속 수정

- **성능:** 17개 컴포넌트의 context value를 메모이제이션했습니다. 부모가 같은 props로 리렌더할 때 하위 컴포넌트가 다시 렌더링되지 않습니다. 대상은 Tabs·Collapsible·Accordion·ToggleGroup·Select·Combobox·Slider·Toast·Form·OneTimePasswordField·Pagination·ContextMenu·HoverCard·Menubar·Tooltip·Avatar·ScrollArea입니다.
- **Slider:** 마운트만으로 숨은 input의 `input` 이벤트를 보내 폼 `onInput`/`onChange`가 초기 렌더에 불리던 문제를 고쳤습니다.
- **Toast:**
  - 스와이프 뒤 click이 오지 않으면 남아 있던 리스너가 나중의 정상 클릭(링크 등)을 막던 문제를 고쳤습니다.
  - 접근성 구조를 바꿨습니다. `role="region"` 랜드마크는 뷰포트 래퍼로 옮기고 `<ol>`은 목록 의미를 유지합니다. 토스트 `<li>`의 `role="status"`/`aria-live`는 제거해 낭독은 Announcer 한 곳에서만 일어납니다(이중 낭독과 허용되지 않은 role 해소). **뷰포트의 `role`을 `<ol>`에서 찾던 코드는 래퍼를 찾도록 바꿔야 합니다.**
- **Combobox:** `FloatingFocusManager`를 `modal={false}`로 바꿨습니다(입력 중 포커스 유지, floating-ui의 combobox 패턴).
- **OneTimePasswordField:** 입력칸이 동적으로 줄어든 뒤 End 등의 키 이동이 사라진 칸을 가리킬 수 있던 문제를 고쳤습니다.
- **hooks `createRecognizer`:** `window`가 없는 SSR 환경에서 `ReferenceError` 대신 문서화된 "not supported" 에러를 던집니다.
