---
"@gugbab/tokens": minor
"@gugbab/styled-mui": minor
"@gugbab/styled-radix": minor
"@gugbab/headless": minor
---

접근성 개선 (WCAG 2.2 AA · WAI-ARIA APG)

**tokens**
- 컨트롤 경계용 `color.border.control` 토큰을 추가했습니다(CSS 변수 `--gugbab-color-border-control`). 기본 테마는 라이트·다크 모두 배경 대비 3:1 이상입니다(WCAG 1.4.11). **선택 필드**라서, 직접 만든 테마에 없으면 `border.strong`으로 채워집니다(하위 호환).
  - mui: 실제 MUI 체크박스 색(`palette.text.secondary`)
  - radix: Radix gray `fg.muted` 단계

**styled-mui / styled-radix** — 기본 외관이 일부 바뀝니다(시각 회귀 기준 이미지 갱신 필요).
- 체크박스·라디오·입력칸·OTP·Select 트리거·Combobox 입력 테두리에 `border-control`을 쓰고, 스위치 꺼짐 트랙에 경계를 추가했습니다(대비 3:1). hover 색은 테두리보다 옅어지지 않게 조정했습니다.
- 무효한 CSS(`rgba(var(--hex) / a)`) 때문에 표시되지 않던 포커스 링을 `color-mix()`로 고쳤습니다. 에러·성공·경고 상태 링도 포함합니다.
- 키보드 포커스 표시를 추가했습니다: Select 항목, Tabs 패널, DropdownMenu 항목, Combobox 활성 항목(`[data-highlighted]`). Combobox 규칙은 이 속성을 내보내는 **headless 수정(Combobox Enter 선택·`data-highlighted`)과 함께 배포되어야 동작**합니다. 그 전에는 효과가 없을 뿐 이전보다 나빠지지는 않습니다. DropdownMenu의 동작하지 않던 `[data-highlighted]` 선택자는 `:focus-visible`로 교체했습니다.
- radix: 거의 보이지 않던 `accent-subtle` 포커스 링을 `border-focus`로 바꿨습니다.
- Toast 닫기 아이콘 색을 `fg-muted`에서 `fg-secondary`로 올렸습니다.

**headless**
- RadioGroup: RTL에서 선택 값과 포커스 위치가 어긋나던 문제를 고쳤습니다. `dir` prop(`'ltr' | 'rtl'`)을 지원하고, 루트에 해석된 `dir` 속성을 렌더링합니다(Tabs 등과 같은 방식). Provider 없이 `<html dir="rtl">`만 쓰는 페이지는 `dir` prop이나 `DirectionProvider`를 지정해 주세요.
- Popover·DropdownMenu:
  - 바깥을 클릭해 닫을 때 포커스를 트리거로 빼앗던 문제를 고쳤습니다.
  - 열린 트리거를 누르면 닫혔다가 바로 다시 열리던 문제를 고쳤습니다.
  - Escape 등으로 닫힐 때는 트리거로 포커스를 명시적으로 복원합니다. 바깥 클릭으로 포커스가 아무 데도 없게 되면(body) 트리거로 되돌립니다. 모달 Popover는 바깥 클릭이어도 트리거로 복원합니다.
  - Popover에 `Anchor`를 함께 써도 트리거 예외와 복원이 트리거 기준으로 동작합니다.
- Dialog: 클릭이 버튼에 포커스를 주지 않는 브라우저(Safari)에서 닫힌 뒤 포커스가 body로 가던 문제를 고쳤습니다. 트리거가 있으면 트리거로 복원하고, 트리거 없이 연 경우에는 열기 전 포커스 요소로 돌아갑니다.
- DropdownMenu 서브메뉴: RTL에서 ArrowLeft로 열리고 왼쪽에 펼쳐집니다. 비활성 SubTrigger는 키·hover·클릭 어느 쪽으로도 서브메뉴를 열지 않습니다.
