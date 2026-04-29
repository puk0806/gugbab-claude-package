# CLAUDE.md — gugbab-claude-package

Claude Code만을 이용해 구축·운영하는 **공용 프론트엔드 패키지 배포용 모노레포**.

---

## 프로젝트 방향

- **패키지 관리 레포** — 최종 산출물은 앱이 아니라 `packages/*` (배포 대상). `apps/`는 문서·Storybook 같은 검증용.
- **모든 프론트엔드 개발자 대상** — 특정 프로젝트 종속 없이 범용·재사용·공개 배포 퀄리티를 목표로 한다.
- **UI는 headless, React 전용** — 동작·상태·접근성만 제공, 스타일은 소비자 지정.
- **bottom-up 구축** — 기반 툴링(tsconfig, eslint-config 등)부터 쌓고 UI는 그 위에.
- **Claude-only 제약** — 외부 CLI·웹 서비스 의존 최소화. Claude Code 에이전트·스킬·훅·슬래시 커맨드 우선.

### 개발 워크플로우 (플러그인 기반)

`.claude/settings.json`의 `enabledPlugins`로 두 플러그인을 강제 적용한다.

| 플러그인                                                                     | 역할                                                                                                       | 주요 커맨드                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`codex@openai-codex`](https://github.com/openai/codex-plugin-cc)            | **2차 코드 리뷰** (Claude 외부의 Codex가 독립 검토)                                                        | `/codex:review`, `/codex:adversarial-review` |
| [`superpowers@superpowers-marketplace`](https://github.com/obra/superpowers) | **TDD 강제**(RED→GREEN→REFACTOR) + 7단계 워크플로우(브레인스토밍→워크트리→계획→서브에이전트→TDD→리뷰→완료) | 스킬·에이전트 자동 로드                      |

사전 요구사항: Node.js 18.18+, `npm install -g @openai/codex`, ChatGPT 구독 또는 OpenAI API 키. 초기 설정은 `/codex:setup`.

**How to apply:**

- 신규 패키지·기능 구현 → superpowers 워크플로우로 TDD 먼저
- PR 전 검증 → `/codex:review`로 Codex 독립 리뷰 받기
- 어려운 설계 결정 → `/codex:adversarial-review`로 반대 의견 수집

### 기술 스택 기본값

- pnpm workspace + Turborepo + Changesets + tsup
- Husky (+ lint-staged, commitlint은 선택)
- 스코프: `@gugbab-ui/*`

### 빌드 순서 (의존성 방향)

1. 레포 인프라 (`pnpm-workspace.yaml`, `turbo.json`, `.changeset`, Husky)
2. `packages/tsconfig` — 공용 tsconfig 프리셋
3. `packages/eslint-config` — 공용 ESLint 프리셋
4. `packages/utils` — 프레임워크 독립 순수 유틸
5. `packages/hooks` (선택) — React 공용 훅
6. `packages/headless` — `@gugbab-ui/headless` (헤드리스 React 컴포넌트, 35종)
7. `packages/tokens` — 추상 디자인 토큰 타입 + 정적 MUI/Radix 스냅샷 → `dist/{mui,radix}.css` CSS variables. 외부 라이브러리 의존성 0
8. `packages/styled-mui` / `packages/styled-radix` — 헤드리스 위에 얹는 스타일 패키지 (각각 35종, `gmui-*` / `grx-*` 클래스)
9. `apps/storybook-mui` / `apps/storybook-radix` — 시스템별 독립 쇼케이스 (Storybook 10)

---

## 컨텍스트 관리

- 관련 없는 작업 사이에는 `/clear`로 컨텍스트 초기화
- 같은 실수를 2번 이상 수정하면 `/clear` 후 더 구체적인 프롬프트로 재시작
- 파일을 많이 읽는 조사 작업은 서브에이전트에 위임

---

## 금지 사항

- API 키·토큰·비밀번호를 파일에 직접 작성 금지
- 검증되지 않은 외부 소스 그대로 복붙 금지
- `apps/`에 웹 서비스 추가 금지 — 문서/쇼케이스 용도만 허용
- 특정 프로젝트·스타일에 종속된 구현 금지 — 범용성 훼손
- 테스트되지 않은 에이전트를 main 브랜치에 직접 커밋 금지
- verification.md, SKILL.md를 Bash(sed/awk 등)로 수정 금지 — Write/Edit 도구 사용
- PENDING_TEST → APPROVED 일괄 전환 금지 — 스킬별 개별 검증 필수

---

## 상황별 규칙 참조

| 상황                    | 참조 파일                             |
| ----------------------- | ------------------------------------- |
| Git 커밋 컨벤션         | @.claude/rules/git.md                 |
| 외부 정보 조사·검증     | @.claude/rules/info-verification.md   |
| 에이전트 설계·작성      | @.claude/rules/agent-design.md        |
| 스킬·에이전트 생성 절차 | @.claude/rules/creation-workflow.md   |
| README 업데이트         | @.claude/rules/readme-update.md       |
| 검증 정책·APPROVED 전환 | @.claude/rules/verification-policy.md |
| TypeScript / React 코딩 | @.claude/rules/typescript.md          |
