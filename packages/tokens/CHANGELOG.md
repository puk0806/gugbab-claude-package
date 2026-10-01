# @gugbab/tokens

## 1.1.0

### Minor Changes

- 1b0479e: 접근성 후속 개선

  **headless**

  - NavigationMenu: 열린 메뉴 안에서 Escape를 누르면 닫히고 포커스가 해당 트리거로 돌아갑니다(APG Disclosure Navigation). 이 Escape는 바깥으로 전파되지 않으므로, 메뉴를 감싼 Dialog·Popover까지 함께 닫히지 않습니다.
  - NavigationMenu.Trigger에 `id`를 직접 지정하면 Content의 `aria-labelledby`가 그 id를 가리킵니다. 이전에는 생성된 id를 가리켜 연결이 끊겼습니다.
  - NavigationMenu.Link: `active` prop을 추가했습니다. 지정하면 `aria-current="page"`와 `data-active`를 렌더링합니다. `NavigationMenuLinkProps` 타입을 export합니다.
  - Dialog(비모달, `modal={false}`): 바깥의 다른 컨트롤을 눌러 닫으면 포커스를 그 컨트롤에 둡니다(Radix와 동일). Escape나 닫기 버튼으로 닫으면 트리거로 돌아갑니다. 모달 Dialog 동작은 그대로입니다.
  - Dialog·DropdownMenu·Popover·RadioGroup·Switch·Checkbox: context 값을 메모하고 ref 병합을 안정화해, 부모가 다시 렌더링될 때 하위 파트가 불필요하게 다시 렌더링되거나 ref 콜백이 매번 재호출되던 문제를 고쳤습니다.

  **tokens** — 동작 변경

  - `tokensToVars`·`renderThemeCss`가 선언이나 블록을 탈출할 수 있는 값에 `TypeError`를 던집니다. 이전에는 조용히 깨진 CSS를 출력했습니다. 거부하는 값은 다음과 같습니다.
    - 빈 값
    - 따옴표·괄호 밖의 `;` `{` `}`
    - 닫히지 않은 따옴표나 괄호
    - 따옴표 안의 줄바꿈
    - `</`
  - 따옴표 밖의 CSS 주석(`/*`)과, 따옴표 없는 `url(...)` 안의 따옴표·괄호·공백(브라우저가 `url`을 일찍 끝내는 형태)도 거부합니다.
  - 따옴표·괄호 안의 `;` `}`는 허용하므로 `url("data:...;base64,...")` 같은 값은 그대로 동작합니다. 여러 줄 값(템플릿 리터럴 shadow 등)은 한 줄로 합칩니다.
  - 토큰 키는 영문·숫자·`-`·`_`·`.`만 허용합니다. `.`은 이스케이프해 `space: { "0.5": … }`를 `--gugbab-space-0\.5`로 내보냅니다. 이전 출력은 CSS 이름으로 무효였습니다.
  - 헤더 주석 안의 `*/`와 `</`를 이스케이프합니다.

  **styled-mui / styled-radix**

  - `prefers-reduced-motion: reduce`에서 이 패키지 클래스가 붙은 요소의 전환·애니메이션을 `!important`로 사실상 끕니다(무한 로딩 애니메이션 포함). 같은 요소에 소비자가 지정한 애니메이션도 이 설정에서는 꺼집니다.
  - Windows 고대비(`forced-colors: active`)에서 스위치·체크박스·라디오의 상태가 시스템 색으로 보이게 했습니다.
  - 체크박스·라디오·스위치·Toast 닫기 버튼에 최소 24×24px 포인터 영역을 보장합니다(WCAG 2.5.8). 보이는 크기는 그대로입니다. 해당 루트에 `position: relative`가 추가되지만 `:where()`로 특이도가 0이라 소비자의 `position` 지정이 항상 우선합니다.

- 1a26c3f: 접근성 개선 (WCAG 2.2 AA · WAI-ARIA APG)

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

  - RadioGroup: RTL에서 선택 값과 포커스 위치가 어긋나던 문제를 고쳤습니다. `dir` prop(`'ltr' | 'rtl'`)을 지원합니다. 루트의 `dir` 속성은 prop이나 `DirectionProvider`로 명시했을 때만 렌더링하므로 `<html dir="rtl">`을 상속하는 화면 표시는 그대로입니다. 다만 키보드 방향은 명시값(없으면 LTR)을 따르므로, Provider 없이 `<html dir="rtl">`만 쓰는 페이지는 `dir` prop이나 `DirectionProvider`를 지정해 주세요.
  - Popover·DropdownMenu:
    - 바깥을 클릭해 닫을 때 포커스를 트리거로 빼앗던 문제를 고쳤습니다.
    - 열린 트리거를 누르면 닫혔다가 바로 다시 열리던 문제를 고쳤습니다.
    - Escape 등으로 닫힐 때는 트리거로 포커스를 명시적으로 복원합니다. 바깥 클릭으로 포커스가 아무 데도 없게 되면(body) 트리거로 되돌립니다. 모달 Popover는 바깥 클릭이어도 트리거로 복원합니다.
    - Popover에 `Anchor`를 함께 써도 트리거 예외와 복원이 트리거 기준으로 동작합니다.
  - Dialog: 클릭이 버튼에 포커스를 주지 않는 브라우저(Safari)에서 닫힌 뒤 포커스가 body로 가던 문제를 고쳤습니다. 트리거가 있으면 트리거로 복원하고, 트리거 없이 연 경우에는 열기 전 포커스 요소로 돌아갑니다.
  - DropdownMenu 서브메뉴: RTL에서 ArrowLeft로 열리고 왼쪽에 펼쳐집니다. 비활성 SubTrigger는 키·hover·클릭 어느 쪽으로도 서브메뉴를 열지 않습니다.

### Patch Changes

- 0d2c8ef: 구조·배포 정리

  - styled-mui / styled-radix: `DirectionProvider`·`useDirection`(과 `Direction`·`DirectionProviderProps` 타입)을 다시 내보냅니다. `@gugbab/headless`를 따로 설치하지 않고 RTL을 설정할 수 있습니다. 앱에 다른 버전의 headless가 설치되어 있어도, styled 패키지에서 가져온 Provider는 styled 컴포넌트와 같은 Context를 씁니다.
  - utils: SSE 이벤트 타입에 확장 지점을 추가했습니다.
    - `SseCoreEvent`(chunk·done·error)를 새로 둡니다.
    - `SseEvent<TExtra>`로 앱별 이벤트 **타입**을 선언할 수 있습니다. `SseEvent<never>`는 공통 이벤트만 포함합니다. 확장은 현재 **타입 전용**입니다. `parseSSELine`·`readSSEStream`·`toSSELine`은 공통 이벤트와 `safety_block`만 인식하고, 그 밖의 `type`은 파서가 버립니다.
    - 기본 `SseEvent`는 기존과 동일합니다.
    - relay 전용 `safety_block`은 `SseSafetyBlockEvent`로 분리하고 `@deprecated` 처리했습니다. 다음 major에서 타입과 파서 지원 모두 제거할 예정이며, 필요한 앱은 직접 선언해 `SseEvent<...>`로 넘기면 됩니다.
  - headless: 사용하지 않던 `@gugbab/utils` 직접 의존성을 제거했습니다. utils는 hooks를 거쳐 여전히 전이 설치됩니다.
  - tokens: README의 사용 예제를 실제 API(`muiTheme`·`radixTheme`·`renderThemeCss`)로 수정했습니다. 이전 예제의 `muiTokensLight` 등은 존재하지 않는 export였습니다.
