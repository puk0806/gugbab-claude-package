# @gugbab/relay-types

`gugbab-claude-relay` API의 TypeScript 타입 패키지입니다. relay 서버가 내보내는 OpenAPI 스펙에서 **자동 생성**되며, 타입만 포함합니다(런타임 코드 없음).

## 설치

```bash
pnpm add -D @gugbab/relay-types
```

## 사용

```ts
import type { ChatRequest, SSEEvent, ErrorResponse, ModelsResponse } from '@gugbab/relay-types';

const body: ChatRequest = { /* ... */ };

function handle(event: SSEEvent) {
  // SSEChunk | SSEDone | SSEError
}
```

원본 생성 타입(`paths`·`components`·`operations`)도 함께 export합니다.

```ts
import type { paths } from '@gugbab/relay-types';

type ChatBody = paths['/api/chat']['post']['requestBody'];
```

## 제공 타입

| 타입 | 설명 |
|---|---|
| `ChatRequest`, `Message`, `MessageRole` | 채팅 요청 본문 |
| `SSEEvent` (`SSEChunk`·`SSEDone`·`SSEError`) | 스트리밍 응답 이벤트 |
| `ErrorResponse`, `ErrorCode` | 오류 응답 |
| `ModelsResponse`, `ModelInfo`, `ModelAlias` | 모델 목록 |
| `AppType` | 앱 구분자 |

## 버전 정책

- 버전 형식은 `1.0.0-{YYYYMMDDHHMM}`입니다(스펙 변경 시점의 타임스탬프).
- relay 서버가 Production에 배포되면 스펙을 다시 생성하고, **변경이 있을 때만** 새 버전을 자동으로 게시합니다(`.github/workflows/relay-types-publish.yml`).
- Changesets 대상이 아니며, 레포 안에서는 `private: true`로 게시를 막아 두고 게시 워크플로우에서만 해제합니다.
- 서버 스펙이 바뀌면 타입이 바뀌므로, 소비 앱은 버전을 고정해서 쓰는 것을 권장합니다.

## 개발

```bash
pnpm --filter @gugbab/relay-types generate   # 스펙에서 src/generated.ts 재생성
pnpm --filter @gugbab/relay-types build
```

`src/generated.ts`는 생성 파일이므로 직접 수정하지 않습니다.

## License

MIT
