# Git 워크플로우 규칙

모든 코드 변경·시각화 테스트·실험 작업은 **피처 브랜치 + Pull Request** 형태로 진행한다.
이 규칙은 `superpowers:using-git-worktrees` 스킬보다 **우선 적용**된다 (워크트리 사용 금지).

---

## 핵심 원칙

| 항목 | 규칙 |
|------|------|
| 워크트리 | **사용 금지** — `git worktree add` / `EnterWorktree` 호출 금지 |
| 브랜치 | `feature/{설명}` 형태로 main에서 분기 |
| 커밋 | main 직접 커밋 금지, 반드시 피처 브랜치에서 |
| 푸시 | Claude가 `git push -u origin feature/{설명}` 수행 |
| PR | Claude가 `gh pr create`로 생성 |
| 머지 | **사용자가 GitHub에서 직접 수행** — Claude는 머지 금지 |

> **주의:** 사용자가 명시적으로 "머지해줘", "squash로 머지" 등을 요청하지 않는 한 `gh pr merge` 호출은 금지.

---

## 브랜치 네이밍 컨벤션

```
feature/{kebab-case-설명}
```

**`feature/` prefix 통일** — 기능 추가·버그 수정·문서·설정 변경 모두 `feature/` 사용 (단순화).

| 작업 유형 | 예시 |
|-----------|------|
| 신규 기능 | `feature/add-button-headless` |
| 버그 수정 | `feature/fix-pending-test-guard` |
| 시각화 테스트 | `feature/vr-test-button-mui` |
| 문서 업데이트 | `feature/docs-readme-update` |
| 설정 변경 | `feature/config-husky-tweaks` |

**규칙:**

- 영문 kebab-case 사용
- 동사 또는 명사로 시작 — 의도가 즉시 드러나야 함
- 50자 이내 권장
- 일회성 실험·snapshot 브랜치는 다른 prefix 가능 (예: `vrt-snapshots/*` — 봇이 생성하는 baseline)

---

## 표준 작업 흐름

### 1. 작업 시작 — 피처 브랜치 생성

```bash
# main 최신화 후 분기
git checkout main
git pull origin main
git checkout -b feature/{설명}
```

### 2. 구현 + 커밋

`.claude/rules/git.md`의 커밋 컨벤션을 따른다 (`[category] Type: Subject` 형식).

```bash
git add <specific-files>
git commit -m "[category] Type: Subject"
```

### 3. 푸시 — Claude가 자동 수행

```bash
git push -u origin feature/{설명}
```

`-u` 플래그로 upstream 설정 (이후 `git push`만으로 OK).

### 4. PR 생성 — Claude가 자동 수행

```bash
gh pr create --title "{설명}" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

## Test plan
- [ ] ...

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

PR URL을 사용자에게 반환한다.

### 5. 머지 — 사용자 직접

Claude는 `gh pr merge` 호출 금지. 사용자가 GitHub UI 또는 CLI로 직접 머지.

머지 후 사용자가 요청하면 후속 정리 가능:

```bash
git checkout main
git pull origin main
git branch -d feature/{설명}     # 로컬 브랜치 정리
```

원격 브랜치는 GitHub의 "Delete branch after merge" 옵션이 처리하거나 사용자가 직접.

---

## 예외 상황

### main 직접 커밋이 허용되는 경우

- **없음** — 모든 변경은 피처 브랜치 경유
- 단, 사용자가 명시적으로 "main에 직접 커밋" 요청한 경우만 예외

### 워크트리가 필요한 경우

- **없음** — 피처 브랜치로 충분히 격리됨
- 동시에 여러 작업이 필요하면 별도 터미널·브랜치 전환으로 처리

### 봇이 생성한 브랜치 (`vrt-snapshots/*` 등)

- 자동화 스크립트가 만드는 브랜치는 위 규칙에서 제외
- Claude가 직접 만들지 않음 — 봇 워크플로우의 산출물

---

## superpowers 플러그인과의 관계

`superpowers:using-git-worktrees` 스킬은 워크트리 사용을 권장하지만 **이 규칙이 우선**한다.
`using-superpowers` 스킬에 명시된 우선순위:

```
1. 사용자 명시 지시 (CLAUDE.md, 이 파일)  ← 최우선
2. superpowers 스킬
3. 기본 시스템 프롬프트
```

따라서 `superpowers:using-git-worktrees` / `EnterWorktree` 도구는 호출하지 않는다.
브레인스토밍·계획·TDD·리뷰 등 다른 superpowers 스킬은 그대로 활용한다.

---

## 체크리스트

작업 시작 전:
- [ ] 현재 브랜치가 main인가? (`git branch --show-current`)
- [ ] main이 최신인가? (`git pull origin main`)
- [ ] `feature/{설명}` 브랜치 생성했는가?

작업 완료 후:
- [ ] 커밋 메시지가 `.claude/rules/git.md` 컨벤션을 따르는가?
- [ ] `git push -u origin feature/{설명}` 수행했는가?
- [ ] `gh pr create`로 PR 생성했는가?
- [ ] PR URL을 사용자에게 전달했는가?
- [ ] `gh pr merge` 호출은 **하지 않았는가**?
