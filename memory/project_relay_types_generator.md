---
name: relay-types-types-generator-changeset
description: "OpenAPI → TS 타입 자동 생성 인프라 (2026-07-08). 코드·테스트·빌드 완료, changeset·커밋·PR 미완 상태."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8e0d09ad-495c-46b8-a5c2-315d32a72ea9
---

2026-07-08 세션(export: `exports/2026-07-08-bddf08e1.md`)에서 OpenAPI 타입 자동 생성 인프라 구축. `feature/update-agents-skills-hooks-cleanup` 브랜치에 **미커밋** 상태로 존재.

**구성:**
- `packages/types-generator` (`@gugbab/types-generator`, private 내부 도구) — openapi-typescript v7 래퍼. SSL 체인 오류 때문에 Node fetch 대신 curl로 스펙 다운로드 후 `file://` URL로 변환해 처리
- `packages/relay-types` (`@gugbab/relay-types` v0.1.0, publishable) — gugbab-claude-relay API (`https://gugbab-claude-relay.vercel.app/api/openapi.json`) 타입 13종 자동 생성. `pnpm generate` → `src/generated.ts` → tsup 빌드
- `turbo.json`에 `generate` 태스크 추가 (cache: false)
- `tdd-guard.js`에 auto-generated 파일 제외 처리 추가

**설계 결정:** API별 개별 패키지(`relay-types`, 추후 `apple-types` 등) 방식 채택 — 통합 `@gugbab/types` 단일 패키지 대신. [[feedback_package_naming_clarity]]

**완료:** generate 실행(13 타입), 빌드(dist/index.d.ts 9.49KB), 테스트 7개 통과, typecheck 통과, README 반영

## 타임스탬프 자동 publish 설계 (2026-07-08 확정)

사용자 결정: 스펙만 바뀌고 소스는 안 바뀌므로 changesets 버전 관리 대신 **타임스탬프 prerelease 버전**(`{base}-{YYYYMMDDHHMM}`, Asia/Seoul)으로 publish.

- **changesets 영구 제외**: `.changeset/config.json`의 `ignore`는 공식 문서상 임시 용도 → 대신 `package.json`에 `private: true` 박고, publish 워크플로우에서만 `npm pkg delete private` 후 게시
- **build는 `tsup`만** (generate 분리) — 루트 `turbo run build`가 네트워크에 의존하지 않도록
- **자동 트리거 체인**: relay 레포 Vercel Production 배포 성공(`deployment_status`) → `notify-types-package.yml`이 repository_dispatch(`relay-spec-updated`) 발사 → 패키지 레포 `relay-types-publish.yml`이 generate → `git diff -I'^// Generated:' -I'^// Source:'`로 헤더 제외 변경 감지 → 변경 시에만 publish. 배포 성공 이벤트 기준이라 push+sleep 레이스 없음
- 최초 게시는 workflow_dispatch `force=true`로 (스펙 변경 없어도 게시)
- base 버전(0.1.0)은 breaking 시에만 수동 bump

## 2026-07-08 파이프라인 가동 완료

- PR #32 머지 → relay 레포 워크플로우 푸시 → **전체 체인 첫 가동 성공, `0.1.0-202607081406` npm 자동 게시** (latest 태그)
- PAT secret `TYPES_DISPATCH_TOKEN` relay 레포 등록 완료
- relay 레포 특이사항: default 브랜치가 `feature/initial-project-setup`였고 원격 main은 내 푸시로 생성됨. Vercel production branch = main (main 푸시가 Production 배포 유발 확인). deployment_status 워크플로우는 default 브랜치가 main이 아니어도 동작함을 실측 확인
- **재게시 버그 2건 발견·수정** (branch `feature/exclude-generated-from-biome`, 머지 대기):
  1. lint-staged biome이 generated.ts 리포맷 → CI 원본과 달라 매 배포 오탐 publish → biome.json `"!**/src/generated.ts"` 제외 + 원본 포맷 재커밋
  2. baseline 미갱신 → 스펙 변경 1회가 이후 배포마다 중복 게시 → publish 후 CI가 generated.ts를 main에 커밋백 (`[skip ci]`)
- 교훈: 생성 파일은 포매터 대상에서 제외해야 diff 기반 변경 감지가 성립. 로컬 git 작업 시 memory 훅과 index.lock 경합 → 재시도 루프 필요

**2026-07-08 최종 검증 완료:** fix PR #33 머지 후 workflow_dispatch(force 없음) 실행 → "스펙 변경 없음" 스킵 확인. 파이프라인 완성. npm에 `0.1.0-202607081406`(정상), `0.1.0-202607081441`(fix 머지 전 오탐 재게시 — 내용 동일, 무해) 2개 존재.

**남은 일 (선택):** relay 레포 default 브랜치 정리 — 현재 default가 `feature/initial-project-setup`이고 main과 diverged(setup이 4 ahead: docs 404 fix 등 미배포). 정리안: setup→main 머지 + default를 main으로 변경 + setup 삭제. 사용자 결정 대기.
