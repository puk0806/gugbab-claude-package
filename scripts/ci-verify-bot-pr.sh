#!/usr/bin/env bash
# 봇(GITHUB_TOKEN)이 만든 PR 검증 + 필수 검사 상태 등록.
#
# GITHUB_TOKEN 으로 만든 PR 에는 pull_request 워크플로우(ci·visual-regression)가
# 돌지 않는다(GitHub 재귀 방지 정책). main 규칙이 두 검사를 필수로 요구하므로,
# 봇 PR 은 이 스크립트가 같은 검사를 직접 수행한 뒤에만 성공 상태를 등록한다.
#
#   1) 허용 목록 밖 파일이 바뀌었으면 즉시 실패 — 상태를 등록하지 않아 PR 은 막힌 채 남는다
#   2) PR head 커밋에서 ci.yml 과 같은 전체 검사(frozen install·biome ci·typecheck·test·build)
#   3) 모두 통과하면 head 커밋에 `ci`·`visual-regression` 성공 상태 등록
#      (허용 목록은 시각 결과에 영향 없는 파일로만 구성 — 버전·CHANGELOG·생성 타입)
#
# 사용: ci-verify-bot-pr.sh <PR 번호> <허용 경로 정규식>
# 필요 env: GH_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SERVER_URL
set -euo pipefail

PR_NUMBER="${1:?PR 번호가 필요합니다}"
ALLOWED="${2:?허용 경로 정규식이 필요합니다}"

HEAD_SHA=$(gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json headRefOid -q .headRefOid)
HEAD_REF=$(gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json headRefName -q .headRefName)

git fetch --no-tags origin main "$HEAD_REF"
# 러너는 일회용이다 — 앞 단계가 남긴 작업 트리 변경(publish 용 버전 등)을 버리고 PR 커밋을 그대로 검증한다.
git checkout --force --detach "$HEAD_SHA"

CHANGED=$(git diff --name-only origin/main...HEAD)
echo "변경 파일:"
echo "$CHANGED"
OUTSIDE=$(printf '%s\n' "$CHANGED" | grep -Ev "$ALLOWED" | grep -v '^$' || true)
if [ -n "$OUTSIDE" ]; then
  echo "::error::허용 목록 밖 변경이 있어 자동 승인하지 않습니다:"
  echo "$OUTSIDE"
  exit 1
fi

pnpm install --frozen-lockfile
pnpm exec biome ci .
pnpm typecheck
pnpm test
pnpm build

TARGET_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
for CONTEXT in ci visual-regression; do
  gh api -X POST "repos/${GITHUB_REPOSITORY}/statuses/${HEAD_SHA}" \
    -f state=success \
    -f context="$CONTEXT" \
    -f description="봇 PR 검증 통과 (허용 목록·전체 검사)" \
    -f target_url="$TARGET_URL" >/dev/null
  echo "→ ${CONTEXT} 성공 상태 등록: ${HEAD_SHA}"
done
