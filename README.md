# gugbab-claude-package

Claude Code만을 이용해 구축·운영하는 **공용 프론트엔드 패키지 배포용 모노레포**.

프로젝트 방향·워크플로우는 [CLAUDE.md](./CLAUDE.md) 참조.

---

## 구조

```
01_gugbab-claude-package/
├── CLAUDE.md              # 프로젝트 지침
├── .claude/               # Claude Code 자산
│   ├── agents/            # 서브에이전트
│   ├── skills/            # 스킬
│   ├── hooks/             # 훅
│   ├── rules/             # 규칙 문서
│   └── settings.json      # Claude Code 설정·플러그인
├── .husky/                # Git 훅 (pre-commit / commit-msg / pre-push)
├── .changeset/            # Changesets 버전 기록
├── packages/              # 배포 대상 패키지 (@gugbab-ui/*)
│   ├── tsconfig/          # @gugbab-ui/tsconfig
│   ├── biome-config/      # @gugbab-ui/biome-config
│   └── commitlint-config/ # @gugbab-ui/commitlint-config
├── docs/                  # 에이전트·스킬 검증 문서 및 리서치
└── examples/              # CLAUDE.md 템플릿
```

## 배포 패키지 (@gugbab-ui/\*)

| 패키지                           | 역할                        | 상태 |
| -------------------------------- | --------------------------- | ---- |
| `@gugbab-ui/tsconfig`            | 공용 TS 프리셋 (base / react-library / node-library) | 0.0.1 |
| `@gugbab-ui/biome-config`        | 공용 Biome 프리셋 (base.json) | 0.0.1 |
| `@gugbab-ui/commitlint-config`   | 공용 commitlint 컨벤션 (`[category] Type: Subject`) | 0.0.1 |

## 개발 워크플로우

| 단계         | 실행              | 검증 | 차단 |
| ------------ | ----------------- | ---- | :---: |
| pre-commit   | `lint-staged`     | staged 파일에 `biome check --write` | ✅ |
| commit-msg   | `commitlint`      | `[category] Type: Subject` 정규식 | ✅ |
| **pre-push** | `pnpm typecheck && pnpm exec biome ci .` | 전체 레포 typecheck + biome CI | ✅ |
| **pre-push** | `codex review --base <upstream>` | Codex 독립 리뷰 (advisory) | ❌ |

Codex 리뷰 생략: `SKIP_CODEX=1 git push ...`

## Claude 자산 현황

### 에이전트 (19개)

| 카테고리       | 항목                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| devops (1)     | devops-engineer                                                                    |
| domain (3)     | codebase-domain-analyst, product-planner, ui-ux-designer                           |
| frontend (2)   | frontend-architect, frontend-developer                                             |
| meta (5)       | agent-creator, claude-code-guide, freshness-auditor, planner, skill-creator        |
| research (5)   | competitor-analyst, data-analyst, deep-researcher, research-reviewer, web-searcher |
| validation (3) | fact-checker, qa-engineer, source-validator                                        |

### 스킬 (41개)

| 카테고리 | 수  | 항목                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------- | :-: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devops   |  2  | docker-deployment, github-actions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| frontend | 38  | accessibility, animation, api-integration, bundling-compiler, code-convention, component-design, cra-to-vite-migration, css-variables, dayjs, design-patterns, design-token-scss, e2e-testing, error-handling, form-handling, intersection-observer, monorepo-turborepo, mui-v5, mutation-observer, nextjs, page-visibility, performance, radix-ui, react-core, react-dnd, react-virtuoso, resize-observer, sass, seo, state-management, storybook, swiper, testing, tsup, typescript-v4, typescript-v5, vite-advanced-splitting, vite-pwa-service-worker, webpack-vite-config-mapping |
| meta     |  1  | continuous-learning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

### 훅 (5개)

- `auto-approve.js` — 안전 커맨드 자동 승인
- `bash-guard.js` — Bash 명령 실행 전/후 가드
- `session-summary.js` — 세션 종료 요약
- `skill-md-guard.js` — SKILL.md 편집 가드
- `verification-guard.js` — verification.md 편집 가드

### 규칙 (7개)

- `agent-design.md` — 에이전트 설계 기준
- `creation-workflow.md` — 스킬·에이전트 생성 4단계 워크플로우
- `git.md` — Git 커밋 컨벤션
- `info-verification.md` — 외부 정보 검증 원칙
- `readme-update.md` — README 동기화 규칙
- `typescript.md` — TypeScript·React 코딩 규칙
- `verification-policy.md` — 검증 상태 전환 정책

### 플러그인 (프로젝트 레벨)

- [`codex@openai-codex`](https://github.com/openai/codex-plugin-cc) — 2차 코드 리뷰 (Codex가 Claude 외부에서 독립 검토)
- [`superpowers@superpowers-marketplace`](https://github.com/obra/superpowers) — TDD 강제(RED→GREEN→REFACTOR) + 7단계 워크플로우

---

## 업데이트 로그

| 날짜       | 변경 내용                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-04-22 | 초기 스캐폴드 — gugbab-claude 메타 레포에서 프론트엔드 관련 자산 선별 import, Codex·Superpowers 플러그인 등록 |
