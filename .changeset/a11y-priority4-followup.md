---
"@gugbab/tokens": minor
"@gugbab/styled-mui": minor
"@gugbab/styled-radix": minor
"@gugbab/headless": minor
---

접근성 후속 개선

**headless**
- NavigationMenu: 열린 메뉴 안에서 Escape를 누르면 닫히고 포커스가 해당 트리거로 돌아갑니다(APG Disclosure Navigation). 이 Escape는 바깥으로 전파되지 않으므로, 메뉴를 감싼 Dialog·Popover까지 함께 닫히지 않습니다.
- NavigationMenu.Trigger에 `id`를 직접 지정하면 Content의 `aria-labelledby`가 그 id를 가리킵니다. 이전에는 생성된 id를 가리켜 연결이 끊겼습니다.
- NavigationMenu.Link: `active` prop을 추가했습니다. 지정하면 `aria-current="page"`와 `data-active`를 렌더링합니다. `NavigationMenuLinkProps` 타입을 export합니다.
- Dialog·DropdownMenu·Popover·RadioGroup·Switch·Checkbox: context 값을 메모하고 ref 병합을 안정화해, 부모가 다시 렌더링될 때 하위 파트가 불필요하게 다시 렌더링되거나 ref 콜백이 매번 재호출되던 문제를 고쳤습니다.

**tokens** — 동작 변경
- `tokensToVars`·`renderThemeCss`가 선언이나 블록을 탈출할 수 있는 값에 `TypeError`를 던집니다. 이전에는 조용히 깨진 CSS를 출력했습니다. 거부하는 값은 다음과 같습니다.
  - 빈 값
  - 따옴표·괄호 밖의 `;` `{` `}`
  - 닫히지 않은 따옴표나 괄호
  - 따옴표 안의 줄바꿈
  - `</`
- 따옴표·괄호 안의 `;` `}`는 허용하므로 `url("data:...;base64,...")` 같은 값은 그대로 동작합니다. 여러 줄 값(템플릿 리터럴 shadow 등)은 한 줄로 합칩니다.
- 토큰 키는 영문·숫자·`-`·`_`·`.`만 허용합니다. `.`은 이스케이프해 `space: { "0.5": … }`를 `--gugbab-space-0\.5`로 내보냅니다. 이전 출력은 CSS 이름으로 무효였습니다.
- 헤더 주석 안의 `*/`와 `</`를 이스케이프합니다.

**styled-mui / styled-radix**
- `prefers-reduced-motion: reduce`에서 전환·애니메이션을 사실상 끕니다.
- Windows 고대비(`forced-colors: active`)에서 스위치·체크박스·라디오의 상태가 시스템 색으로 보이게 했습니다.
- 체크박스·라디오·스위치·Toast 닫기 버튼에 최소 24×24px 포인터 영역을 보장합니다(WCAG 2.5.8). 보이는 크기는 그대로입니다. 해당 루트에 `position: relative`가 추가되지만 `:where()`로 특이도가 0이라 소비자의 `position` 지정이 항상 우선합니다.
