---
name: relay-types-types-generator
description: "OpenAPI → TS 타입 자동 publish 파이프라인 — 완성·운영 중 (2026-07-08). 아키텍처·운영법·교훈."
metadata:
  node_type: memory
  type: project
  originSessionId: 8e0d09ad-495c-46b8-a5c2-315d32a72ea9
---

**상태: 완성·운영 중** (2026-07-08). `@gugbab/relay-types@1.0.0-202607081514`가 npm latest. 소비: `pnpm add @gugbab/relay-types@latest`.

## 구성

- `packages/types-generator` (private 내부 도구) — openapi-typescript v7 래퍼. SSL 체인 오류 때문에 Node fetch 대신 curl로 스펙 다운로드 후 `file://` URL로 처리
- `packages/relay-types` — relay API(`https://gugbab-claude-relay.vercel.app/api/openapi.json`) 타입 13종. `pnpm generate` → `src/generated.ts` → `index.ts`에서 친숙한 이름 재수출 (신규 스키마 추가 시 재수출 목록 수동 갱신 필요)
- 설계 결정: API별 개별 패키지(`{name}-types`) 방식 — 새 API는 relay-types 패턴 복제. [[feedback_package_naming_clarity]]

## 자동 publish 체인

relay 레포 Vercel **Production 배포 성공**(`deployment_status`, main 커밋 ancestor 검사) → `notify-types-package.yml`이 repository_dispatch(`relay-spec-updated`) → 패키지 레포 `relay-types-publish.yml`: generate → `git diff -I'^// Generated:' -I'^// Source:'` 변경 감지 → 변경 시에만 테스트·빌드 → `{base}-{YYYYMMDDHHMM}`(Asia/Seoul) 게시 → 갱신 generated.ts를 main에 커밋백(`[skip ci]`).

핵심 설계:
- **changesets 영구 제외**: `ignore` 옵션은 공식 문서상 임시 용도 → `private: true` + publish 워크플로우에서만 `npm pkg delete private`
- **build는 tsup만** (generate 분리) — 루트 빌드가 네트워크 비의존
- generated.ts는 **biome 제외**(`biome.json` `"!**/src/generated.ts"`) — 포매터가 건드리면 diff 감지가 영구 오탐
- 배포 성공 이벤트 기준이라 push+sleep 레이스 없음. deployment_status 워크플로우는 default 브랜치가 main이 아니어도 동작함을 실측 확인 (Vercel은 deployment.ref에 브랜치명 아닌 SHA를 넣음)

## 운영

- 스펙 변경 없으면 자동 스킵 (검증 완료). base 버전은 breaking 시에만 package.json 수동 bump
- 강제 게시: Actions → relay-types-publish → Run workflow (`force=true`)
- **PAT 만료 주의**: relay 레포 secret `TYPES_DISPATCH_TOKEN`(fine-grained, 대상 gugbab-claude-package, Contents R/W) 만료 시 dispatch 조용히 실패 → 갱신 필요
- npm 잔존 버전: `0.1.0-202607081406`, `0.1.0-202607081441`(오탐 중복분) — 무해, 방치

## 교훈

- 생성 파일은 포매터·린터 대상에서 제외해야 diff 기반 변경 감지가 성립
- npm에서 같은 버전 재게시 불가 → 타임스탬프는 `+`(build metadata) 아닌 `-`(prerelease) 형식이어야 함. prerelease는 `^` 범위에 안 잡히므로 소비자는 `@latest` 태그 사용
- lfos-ui의 자체 파서 방식과 비교: oneOf/required 미지원·파서 유지보수 부담으로 openapi-typescript 래퍼가 우위. lfos에서 가져올 만한 것: multi-env 스펙 URL, 재수출 자동 생성 (필요 시)
