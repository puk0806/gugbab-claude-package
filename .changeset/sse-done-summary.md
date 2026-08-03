---
"@gugbab/utils": minor
"@gugbab/hooks": minor
---

SSE `done` 이벤트에 선택 필드 `summary` 지원 추가

- `@gugbab/utils`: `SseEvent`의 done 변형을 `{ type: "done"; summary?: string }`로 확장. `parseSSELine` / `readSSEStream` / `toSSELine`은 기존 로직 그대로 summary를 통과시키며, summary 없는 done 이벤트와 100% 하위 호환.
- `@gugbab/hooks`: `useSSEChat`이 done 수신 시 `onDone?.(event)`로 done 이벤트 객체를 전달. `onDone`의 인자는 선택이므로 기존 `() => void` 소비자는 변경 없이 동작. chunk/error 동작 변경 없음.
