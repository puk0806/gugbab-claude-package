# npm v1.0.0 Publishing 설계

> 작성일: 2026-05-08
> 대상: `@gugbab/*` 9개 패키지 동시 v1.0.0 publish 자동화
> 관련: brainstorming 섹션 1-5 합의 결과

---

## 1. 배포 대상

| # | 패키지 | 카테고리 | 의존 |
| --- | --- | --- | --- |
| 1 | `@gugbab/tsconfig` | 인프라 | (none) |
| 2 | `@gugbab/biome-config` | 인프라 | peer: `@biomejs/biome >=2` |
| 3 | `@gugbab/commitlint-config` | 인프라 | peer: `@commitlint/cli >=19` |
| 4 | `@gugbab/utils` | 핵심 | (none) |
| 5 | `@gugbab/hooks` | 핵심 | utils |
| 6 | `@gugbab/headless` | 핵심 | utils, hooks, `@floating-ui/react` |
| 7 | `@gugbab/tokens` | 디자인 | (none) |
| 8 | `@gugbab/styled-mui` | 디자인 | headless, tokens |
| 9 | `@gugbab/styled-radix` | 디자인 | headless, tokens |

토폴로지 정렬: `tsconfig/biome-config/commitlint-config/tokens/utils → hooks → headless → styled-mui/styled-radix`

---

## 2. 핵심 결정 사항

| 항목 | 값 | 근거 |
| --- | --- | --- |
| npm scope | `@gugbab` | Free Org. 사용자 직접 생성 |
| 배포 단위 | 9개 동시 v1.0.0 | 의존 토폴로지 자동 정렬 (`pnpm publish -r`) |
| Token | Granular NPM_TOKEN | scope=`@gugbab`, type=Automation, 만료 1년 |
| 안전 게이트 | 2중 (PR 머지 + Version PR 머지) | 사용자 명시 검토 필수 |
| 품질 게이트 | typecheck / biome ci / test / build / VR | CI required check |
| Provenance | 켜기 (`--provenance` 플래그) | npm 측 GitHub Actions 출처 검증 |
| LICENSE | MIT, holder=`gugbab` | (PR #17에서 적용 완료) |
| README | 패키지별 신규 6 + 보강 3 | (PR #17에서 적용 완료) |

---

## 3. 데이터 흐름

### 3.1 첫 v1.0.0 진입 (1회성)

```
[사전 작업 — 사용자 수동]
1. npm.com Free Org 생성: @gugbab
2. npm 2FA 활성화
3. Granular NPM_TOKEN 발급 (scope=@gugbab, Automation, 1년 만료)
4. GitHub repo Settings → Secrets → NPM_TOKEN 등록

[Claude 작업]
5. 9개 packages/*/package.json version: "0.0.1" → "1.0.0"
6. .changeset/initial-utils.md 정리 (legacy)
7. release.yml workflow_dispatch (mode=initial) 트리거
8. CI: typecheck/test/build → pnpm publish -r --provenance
9. npm.com에 9개 v1.0.0 게시
```

**왜 workflow_dispatch + initial 모드?**
- changesets는 0.x → 1.0 진입을 자동으로 안 함 (0.0.1 + major bump → 0.1.0)
- 첫 진입은 수동 1.0.0 + 직접 publish가 가장 단순
- 이후 변경부턴 표준 changesets 흐름

### 3.2 표준 변경 흐름 (1.0.0 이후)

```
[1] 개발자 PR — 코드 + `pnpm changeset add`로 changeset 파일 생성
[2] CI: 품질 게이트 5종 + publish-dry-run
[3] PR 머지 → main
[4] release.yml 트리거 (push: main)
    └─ changesets/action: 새 changeset 감지 → "Version Packages" PR 자동 생성
       (package.json bump + CHANGELOG 갱신)
[5] 사용자 Version PR 검토 후 머지
[6] release.yml 재트리거 → changeset 0개 → publish 단계 실행
    └─ pnpm changeset publish --provenance
[7] npm.com 새 버전 게시
```

---

## 4. 에러 처리

| 시나리오 | 감지 | 복구 |
| --- | --- | --- |
| NPM_TOKEN 만료/권한 부족 | publish step 401 | 새 토큰 발급 → Secret 갱신 → workflow rerun |
| publish 중간 실패 (일부만 게시) | 의존 패키지 게시 안 됨 | `pnpm publish --filter <pkg>` 수동 |
| 이미 있는 버전 publish 시도 | npm 409 | package.json bump 후 재시도 |
| provenance 실패 | sigstore 인증 X | workflow `permissions.id-token: write` 확인 |
| build/test 실패 | CI required check 차단 | 머지 자체 차단 (가장 안전) |

**롤백**: publish 후 24시간 내 `npm unpublish @gugbab/<pkg>@1.0.0`. 이후 `npm deprecate`만 가능. **첫 publish 전 dry-run + 로컬 pack 검증 필수.**

---

## 5. 테스트 전략

| 단계 | 명령 | 시점 |
| --- | --- | --- |
| PR CI dry-run | `pnpm publish -r --dry-run --no-git-checks` | 매 PR (publish-dry-run.yml) |
| 로컬 pack 테스트 | `pnpm pack` → 다른 프로젝트 `pnpm add ./*.tgz` | 첫 publish 직전 (수동) |
| post-publish smoke | `pnpm dlx @gugbab/utils@1.0.0` | publish 직후 (수동 또는 자동) |

---

## 6. 신규/수정 파일

| 신규 | 파일 |
| --- | --- |
| 1 | `.github/workflows/release.yml` — push:main + workflow_dispatch (initial/changeset 두 모드) |
| 2 | `.github/workflows/publish-dry-run.yml` — pull_request 시 dry-run 검증 |
| 3 | `docs/superpowers/specs/2026-05-08-npm-v1-publishing-design.md` — 본 문서 |

| 수정 | 파일 |
| --- | --- |
| 4-12 | `packages/*/package.json` × 9 — `version: "0.0.1"` → `"1.0.0"` |

| 삭제 | 파일 |
| --- | --- |
| 13 | `.changeset/initial-utils.md` — legacy (PR 1 시점의 minor changeset, v1 진입과 무관) |

---

## 7. 사용자 수동 작업 (Claude 불가)

| # | 작업 | 시점 |
| --- | --- | --- |
| 1 | npm.com `@gugbab` Free Org 생성 | PR 3 머지 전 |
| 2 | npm 2FA 활성화 | PR 3 머지 전 |
| 3 | Granular NPM_TOKEN 발급 (scope=`@gugbab`, Automation, 1년) | PR 3 머지 전 |
| 4 | GitHub Secret `NPM_TOKEN` 등록 | PR 3 머지 전 |
| 5 | release.yml `workflow_dispatch` (mode=initial) 수동 트리거 | PR 3 머지 후 — 첫 v1.0.0 publish |

---

## 8. 향후 변경 가이드

- 코드 PR마다 `pnpm changeset add` 실행 → changeset 파일 commit
- changeset 종류: patch / minor / major (semver 의미 그대로)
- Version PR은 자동 생성됨 — 사용자가 검토 후 머지
- main에 머지 시 자동 publish

**검증 부담 감소**: branch protection + ruleset의 visual-regression required check가 머지 자체를 차단하므로 publish 흐름은 "이미 검증된 코드"만 들어옴.
