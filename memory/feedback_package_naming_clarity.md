---
name: 패키지명은 의도가 즉시 드러나야 함 (모호한 react/core 같은 이름 회피)
description: 모노레포에서 헤드리스/스타일 패키지가 공존할 때 `react` 같은 표준 명명은 모호. 의도가 패키지명에서 즉시 드러나야 한다 (`headless`, `styled-mui` 식).
type: feedback
originSessionId: dae7b45b-3a7d-4ba5-83b4-d274d3166420
---

모노레포에서 한 라이브러리가 헤드리스 + 여러 스타일 어댑터로 분리될 때, 메인 헤드리스 패키지를 단순히 `react`로 명명하면 의도가 모호해진다 (Headless UI, Chakra, Ark UI 등 표준 명명). 다른 패키지(`styled-mui`, `styled-radix`)와 짝을 이루도록 **의도가 드러나는 명명**(`headless`, `primitives`, `base` 등)을 쓴다.

**Why:** 2026-04-29 사용자가 `packages/react` 폴더명을 보고 "먼가 의미가 이상한거 같은데 저게 먼지 알수 없잖아"라고 지적. 이후 `primitives`도 "먼가 이상하다"라고 거절. 결국 `headless`로 결정 (Base UI / bits-ui 트렌드, 사용자 본인이 "headless component"라고 칭함).

**How to apply:**

- 헤드리스 컴포넌트 패키지 → `headless` (의도 즉시 전달)
- 스타일 패키지 → `styled-<system>` (예: `styled-mui`, `styled-radix`)
- 토큰 패키지 → `tokens` (의도 명확)
- 도메인 라이브러리 → `<domain>` (예: `utils`, `hooks`)
- **회피**: `react` (모호), `core` (의미 약함), `lib`, `common`
- 신규 패키지 추가 시 "이 이름만 보고 폴더 안 보고도 역할이 떠오르는가?" 체크
- 업계 표준이라도 우리 모노레포 맥락에서 모호하면 거부 — 사용자 인지 우선

**참고:** Base UI(`@base-ui/react`)처럼 라이브러리 이름 자체에 의도가 있으면 패키지명은 `react`여도 OK이지만, 우리는 `@gugbab` 스코프라 패키지명에서 의도를 표현해야 한다.
