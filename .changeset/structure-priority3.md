---
"@gugbab/styled-mui": minor
"@gugbab/styled-radix": minor
"@gugbab/utils": minor
"@gugbab/headless": patch
"@gugbab/tokens": patch
---

구조·배포 정리

- styled-mui / styled-radix: `DirectionProvider`·`useDirection`(과 `Direction`·`DirectionProviderProps` 타입)을 다시 내보냅니다. `@gugbab/headless`를 따로 설치하지 않고 RTL을 설정할 수 있습니다. 앱에 다른 버전의 headless가 설치되어 있어도, styled 패키지에서 가져온 Provider는 styled 컴포넌트와 같은 Context를 씁니다.
- utils: SSE 이벤트 타입에 확장 지점을 추가했습니다.
  - `SseCoreEvent`(chunk·done·error)를 새로 둡니다.
  - `SseEvent<TExtra>`로 앱별 이벤트 **타입**을 선언할 수 있습니다. `SseEvent<never>`는 공통 이벤트만 포함합니다. 확장은 현재 **타입 전용**입니다. `parseSSELine`·`readSSEStream`·`toSSELine`은 공통 이벤트와 `safety_block`만 인식하고, 그 밖의 `type`은 파서가 버립니다.
  - 기본 `SseEvent`는 기존과 동일합니다.
  - relay 전용 `safety_block`은 `SseSafetyBlockEvent`로 분리하고 `@deprecated` 처리했습니다. 다음 major에서 타입과 파서 지원 모두 제거할 예정이며, 필요한 앱은 직접 선언해 `SseEvent<...>`로 넘기면 됩니다.
- headless: 사용하지 않던 `@gugbab/utils` 직접 의존성을 제거했습니다. utils는 hooks를 거쳐 여전히 전이 설치됩니다.
- tokens: README의 사용 예제를 실제 API(`muiTheme`·`radixTheme`·`renderThemeCss`)로 수정했습니다. 이전 예제의 `muiTokensLight` 등은 존재하지 않는 export였습니다.
