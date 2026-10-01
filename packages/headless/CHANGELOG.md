# @gugbab/headless

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

- 38bf62e: 메뉴·호버카드 접근성과 ref 안정성

  - HoverCard: Content에 `role="dialog"`를 붙이지 않습니다(Radix와 동일). 호버 카드는 이미 접근 가능한 링크의 미리보기라서, 이름 없는 dialog는 스크린 리더에 빈 대화상자로 읽혔습니다. 트리거의 `aria-haspopup`·`aria-expanded`·`aria-controls`도 함께 사라집니다.
  - ContextMenu: 트리거 영역(일반 `div`)에 허용되지 않는 `aria-expanded`·`aria-haspopup`·`aria-controls`를 렌더링하지 않습니다.
  - Menubar: 트리거에 `role="menuitem"`을 지정합니다. `menubar`의 자식은 메뉴 항목이어야 합니다(WAI-ARIA).
  - Accordion.Header: `level` prop(1–6, 기본 3)으로 제목 수준을 문서 구조에 맞출 수 있습니다. `AccordionHeaderProps`·`AccordionTriggerProps`·`AccordionContentProps` 타입을 export합니다.
  - Toast: `Toast.Provider`의 `closeLabel`(기본 `'Close'`)로 아이콘 전용 닫기 버튼의 이름을 현지화합니다. 버튼에 직접 준 `aria-label`이 우선합니다. `aria-label={undefined}`를 넘기면 기본 이름이 사라지던 문제도 고쳤습니다.
  - Tooltip·HoverCard·Menubar·ContextMenu·Select·Combobox·Slider·Toast·OneTimePasswordField·Accordion·Collapsible·ScrollArea: 부모가 다시 렌더링될 때마다 전달한 ref가 `null` → 노드로 재호출되던 문제를 고쳤습니다(ref 병합 안정화).

- 79227b7: 접근성·동작 버그 수정 (WAI-ARIA APG 기준)

  - `useControllableState`: StrictMode에서 `onChange`가 두 번 호출되던 문제 수정. 이 훅을 쓰는 모든 컴포넌트의 `onValueChange`·`onOpenChange` 등에 영향.
  - Combobox: 재오픈·필터링 시 항목 목록이 누적되던 문제 수정. **Enter 키로 활성 항목 선택** 지원 추가(IME 조합 중 Enter는 무시). 활성 항목에 `data-highlighted` 속성 노출 — 스타일에서 키보드 하이라이트에 사용.
  - RovingFocusGroup: 컨테이너의 `tabindex`가 `0` → `-1`로 바뀌어, Tabs·RadioGroup·Toolbar·Accordion 등에서 Tab이 두 번 멈추던 문제 해결. 컨테이너 탭 스톱에 의존하던 테스트가 있다면 갱신 필요.
  - Slider: 가로형에서 ArrowUp은 증가, ArrowDown은 감소(RTL·`inverted`와 무관). 이 키에서 `preventDefault`가 호출되어 더 이상 페이지가 스크롤되지 않음.

- 84137d3: 동작·접근성·성능 후속 수정

  - **성능:** 17개 컴포넌트의 context value를 메모이제이션했습니다. 부모가 같은 props로 리렌더할 때 하위 컴포넌트가 다시 렌더링되지 않습니다. 대상은 Tabs·Collapsible·Accordion·ToggleGroup·Select·Combobox·Slider·Toast·Form·OneTimePasswordField·Pagination·ContextMenu·HoverCard·Menubar·Tooltip·Avatar·ScrollArea입니다.
  - **Slider:** 마운트만으로 숨은 input의 `input` 이벤트를 보내 폼 `onInput`/`onChange`가 초기 렌더에 불리던 문제를 고쳤습니다.
  - **Toast:**
    - 스와이프 뒤 click이 오지 않으면 남아 있던 리스너가 나중의 정상 클릭(링크 등)을 막던 문제를 고쳤습니다.
    - 접근성 구조를 바꿨습니다. `role="region"` 랜드마크는 뷰포트 래퍼로 옮기고 `<ol>`은 목록 의미를 유지합니다. 토스트 `<li>`의 `role="status"`/`aria-live`는 제거해 낭독은 Announcer 한 곳에서만 일어납니다(이중 낭독과 허용되지 않은 role 해소). **뷰포트의 `role`을 `<ol>`에서 찾던 코드는 래퍼를 찾도록 바꿔야 합니다.**
  - **Combobox:** `FloatingFocusManager`를 `modal={false}`로 바꿨습니다(입력 중 포커스 유지, floating-ui의 combobox 패턴).
  - **OneTimePasswordField:** 입력칸이 동적으로 줄어든 뒤 End 등의 키 이동이 사라진 칸을 가리킬 수 있던 문제를 고쳤습니다.
  - **hooks `createRecognizer`:** `window`가 없는 SSR 환경에서 `ReferenceError` 대신 문서화된 "not supported" 에러를 던집니다.

### Patch Changes

- b3672cf: peer 범위 명시: `react`·`react-dom` peer를 `>=18`에서 `^18.0.0 || ^19.0.0`으로 좁혔습니다. 검증되지 않은 미래 major(React 20 등)가 자동으로 허용되지 않습니다. React 18·19 사용자에게는 변화가 없습니다. React 20 이상이나 canary를 쓰면 설치 시 peer 경고(엄격 모드에서는 오류)가 날 수 있습니다. 새 major는 지원을 검증한 뒤 범위를 넓힙니다.
- 0d2c8ef: 구조·배포 정리

  - styled-mui / styled-radix: `DirectionProvider`·`useDirection`(과 `Direction`·`DirectionProviderProps` 타입)을 다시 내보냅니다. `@gugbab/headless`를 따로 설치하지 않고 RTL을 설정할 수 있습니다. 앱에 다른 버전의 headless가 설치되어 있어도, styled 패키지에서 가져온 Provider는 styled 컴포넌트와 같은 Context를 씁니다.
  - utils: SSE 이벤트 타입에 확장 지점을 추가했습니다.
    - `SseCoreEvent`(chunk·done·error)를 새로 둡니다.
    - `SseEvent<TExtra>`로 앱별 이벤트 **타입**을 선언할 수 있습니다. `SseEvent<never>`는 공통 이벤트만 포함합니다. 확장은 현재 **타입 전용**입니다. `parseSSELine`·`readSSEStream`·`toSSELine`은 공통 이벤트와 `safety_block`만 인식하고, 그 밖의 `type`은 파서가 버립니다.
    - 기본 `SseEvent`는 기존과 동일합니다.
    - relay 전용 `safety_block`은 `SseSafetyBlockEvent`로 분리하고 `@deprecated` 처리했습니다. 다음 major에서 타입과 파서 지원 모두 제거할 예정이며, 필요한 앱은 직접 선언해 `SseEvent<...>`로 넘기면 됩니다.
  - headless: 사용하지 않던 `@gugbab/utils` 직접 의존성을 제거했습니다. utils는 hooks를 거쳐 여전히 전이 설치됩니다.
  - tokens: README의 사용 예제를 실제 API(`muiTheme`·`radixTheme`·`renderThemeCss`)로 수정했습니다. 이전 예제의 `muiTokensLight` 등은 존재하지 않는 export였습니다.

- Updated dependencies [79227b7]
- Updated dependencies [84137d3]
- Updated dependencies [2398432]
- Updated dependencies [b3672cf]
  - @gugbab/hooks@1.3.1

## 1.0.5

### Patch Changes

- Updated dependencies [cd928cb]
  - @gugbab/hooks@1.3.0
  - @gugbab/utils@1.4.0

## 1.0.4

### Patch Changes

- Updated dependencies [91889b1]
  - @gugbab/utils@1.3.0
  - @gugbab/hooks@1.2.1

## 1.0.3

### Patch Changes

- Updated dependencies [16829d7]
  - @gugbab/utils@1.2.0
  - @gugbab/hooks@1.2.0

## 1.0.2

### Patch Changes

- Updated dependencies
  - @gugbab/utils@1.1.0
  - @gugbab/hooks@1.1.0

## 1.0.1

### Patch Changes

- 57cfcff: # v1.0.1 — 품질 리팩토링 (RSC 호환성 + SSR 안전성 + 캡슐화 정돈)

  ## Critical fixes

  - **`"use client"` 배너가 dist 첫 줄에 정상 삽입됨.** v1.0.0에선 tsup 의 banner 옵션을 esbuild 가 module-level directive 로 인식해 무력화시켜 4 패키지(`@gugbab/headless`, `@gugbab/hooks`, `@gugbab/styled-mui`, `@gugbab/styled-radix`) 의 산출물에 `"use client";` 가 누락되어 Next.js App Router(RSC) 환경에서 즉시 빌드/런타임 실패가 발생했다. 빌드 후처리 스크립트(`scripts/inject-use-client.mjs`)로 dist 첫 줄에 directive 를 강제 삽입하도록 변경.
  - **`Select.ScrollDownButton` 의 `onPointerEnter` 사용자 콜백이 `onPointerLeave` 로 잘못 라우팅되던 버그 수정.** 사용자가 `onPointerEnter` 핸들러를 넘기면 호출되지 않고 `onPointerLeave` 가 두 번 호출되던 회귀. `Select.ScrollUpButton` 은 정상이었음. 회귀 테스트 4개 추가.

  ## SSR / 안전성

  - 11곳의 `useLayoutEffect` 사용을 `@gugbab/hooks` 의 `useIsomorphicLayoutEffect` 로 교체 (Portal / Avatar / Slider / Toast / usePresence / ScrollArea / BubbleInput) — Next.js Client Component 의 1차 SSR 렌더 시 `"useLayoutEffect does nothing on the server"` 경고가 stderr 에 출력되던 노이즈 제거.
  - `Dialog` / `Progress` 의 `console.error` dev warning 에 `process.env.NODE_ENV !== 'production'` 가드 추가 — production 콘솔 노이즈 방지 + 번들러의 dead-code 제거 가능.
  - `Toast.Root` unmount 시 `closeTimerRef` cleanup effect 추가 — 빠른 unmount 시 stale 컴포넌트에 `setOpen(false)` 가 호출되던 race 차단.
  - `Slider.registerThumb` 시그니처 변경: `() => number` → `() => { index, unregister }`. Thumb 동적 add/remove 시 카운터 누수 차단. (internal contract 변경, 외부 사용자 영향 0.)
  - `Tooltip` Provider 의 `isOpenDelayedRef` 를 ref 대신 state 로 변경 — render 중 ref.current 를 직접 읽어 첫 렌더 시 capture 된 값이 stale 해지던 race 해소.

  ## 캡슐화·구조 정돈

  - `ScrollArea` 를 `headless/src/shared/` (internal building block) → `headless/src/primitives/` 로 이동. 5-tier 분류와의 일관성 회복. `@gugbab/headless` barrel 경로는 그대로이므로 사용자 영향 0.
  - `cn` 유틸리티를 styled-mui / styled-radix 의 로컬 `utils/cn.ts` 중복 정의에서 `@gugbab/utils/string/cn` 으로 hoist. styled-\* 의 internal import 변경, 외부 사용자 영향 0.
  - styled-mui / styled-radix 의 `scripts/build-css.mjs` 중복을 루트 `scripts/build-styled-css.mjs` 한 파일로 통합 (`<variant>` 인자로 분기).
  - `headless/src/index.ts` 의 `shared/*` 노출 의도 명시 주석 추가 — v2 에서 stable Advanced API 로 graduate 할지 internal subpath 로 격리할지 결정 예정.

  ## DRY / minor cleanup

  - `useLatestRef` 중복 정의 2곳(DismissableLayer, FocusScope) 제거 → `@gugbab/hooks` 의 단일 정의 사용.
  - `Slot.tsx` 의 `Symbol.for('react.lazy')` 모듈 상수로 호이스팅 (render 마다 호출되던 lookup 1회 감소).
  - `RovingFocusGroup` 의 `setTimeout(0)` 에 cleanup 추가 — 키 입력 직후 unmount 시 detached 노드에 focus 시도하던 race 차단.
  - `Dialog` 의 `eslint-disable` 주석 → `biome-ignore` 로 통일 (프로젝트가 Biome 사용).
  - `@gugbab/utils` 의 미사용 `type-fest` devDep 제거.
  - `Toast.Viewport` 의 hotkey effect 가 inline `hotkey` prop 으로 매 렌더 listener 재설치되던 churn 차단 — `useLatestRef` 로 핸들러는 mount-only 등록.
  - `DismissableLayer` 의 모듈-레벨 mutable state (`originalBodyPointerEvents`) 를 `WeakMap<Document, string | null>` 로 격리. SSR 멀티-테넌트 cross-request leak 가능성 차단.
  - `forwardRef` 컴포넌트의 `displayName` 명시 일관성 — 13곳에 명시되어 있던 displayName 을 모두 제거하고 named function expression 의 자동 추론에 일관 의존 (DevTools 표시는 동일).

  ## 회귀 안전망 보강

  - `@gugbab/styled-mui` 와 `@gugbab/styled-radix` 에 다층 wrapper 테스트 추가:
    - **통합 smoke** (`styled-smoke.test.tsx`) — 35 컴포넌트 export integrity + compound part structure + 단순 컴포넌트 className 합성. styled-mui +32 / styled-radix +32.
    - **variant/size 회귀** (`variants.test.tsx`) — Accordion / AlertDialog / Dialog / Pagination / Slider / Combobox / Select / Toggle / ToggleGroup / Form 의 BEM modifier 분기 + consumer className 합성. styled-mui +31 / styled-radix +31.
    - **컴포넌트별 분리 테스트 28개씩** — 신규 wrapper 의 className 부착 / compound part / variant·size 분기 / consumer className 합성 / ref forwarding 을 컴포넌트 단위로 분리 검증 (Accordion / AlertDialog / AspectRatio / Breadcrumbs / Collapsible / Combobox / ContextMenu / Dialog / DropdownMenu / Form / HoverCard / Menubar / NavigationMenu / OneTimePasswordField / Pagination / Popover / Portal / ScrollArea / Select / Separator / Slider / Slot / Toast / Toggle / ToggleGroup / Toolbar / Tooltip / VisuallyHidden). styled-mui +97 / styled-radix +97.
    - **합계 +320 신규 테스트** (총 640 → **970 tests**).

  ## Style / 타입 정밀화

  - `Toolbar.ToggleGroup` 의 `(props as any)` 우회 제거 → `props.type` 으로 discriminated union narrow 후 spread.
  - `Slot` 의 `mergeProps` 핸들러 chain `(...a: any[])` cast 두 곳 → 단일 `(...a: unknown[]) => unknown` 타입 별칭으로 정리.
  - `Slot.Slottable` 의 `__slottableId` 에 `@internal` JSDoc 추가 — IDE / API extractor 가 사용자에게 노출하지 않도록 표시.

  ## 환경 / 호환성

  - 루트 `engines.node` 를 `>=20.17.0` → `>=20.19.0` 으로 상향 (개발 환경 — Storybook 10 요구치 일치).
  - 9 publishable 패키지의 `engines.node` 를 `>=20.17.0` → `>=18.0.0` 으로 _완화_. publishable 패키지의 `engines` 는 _소비자_ 환경 호환을 의미하므로 React 라이브러리 표준값(Node 18+)을 따른다.

  ## 성능 / 산출물 최적화

  - **Context Provider value 안정화** — 9 컴포넌트(Progress / Checkbox / Switch / Toolbar / NavigationMenu / Toast / Select / DropdownMenu / Menubar)의 `<Ctx.Provider value={{...}}>` 인라인 객체를 `useMemo` 로 감쌌다. Provider 가 부모 props 변경으로 재렌더될 때 모든 consumer 가 강제 재렌더되던 패턴 차단. 15곳 인라인 value 모두 정리.
  - **CSS 번들 minify** — `scripts/build-styled-css.mjs` 가 dist/styles.css 를 미니파이(주석 / 공백 / 트레일링 세미콜론 정리)하도록 변경. 사이즈 **약 19% 감소**:
    - `@gugbab/styled-mui/styles.css`: 74,498B → **57,663B** (-16,835B)
    - `@gugbab/styled-radix/styles.css`: 70,890B → **54,850B** (-16,040B)
    - 사용자가 import 만 하면 자동 적용. 디버그 빌드는 `--no-minify` 플래그 가능.

- Updated dependencies [57cfcff]
  - @gugbab/hooks@1.0.1
  - @gugbab/utils@1.0.1
