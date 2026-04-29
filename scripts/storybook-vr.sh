#!/usr/bin/env bash
# Storybook visual regression runner (Playwright direct mode).
#
# Usage:
#   bash scripts/storybook-vr.sh                  # mui + radix 모두
#   bash scripts/storybook-vr.sh --project=mui    # mui만
#   bash scripts/storybook-vr.sh --project=radix  # radix만
#   bash scripts/storybook-vr.sh --update         # baseline 갱신 (양쪽)
#
# 자동:
# - storybook-static 디렉토리가 없으면 sb:build:<system>을 호출
# - playwright webServer로 양쪽 정적 서버를 띄우고 자동 종료
# - baseline은 e2e/visual/__screenshots__/<project>/<story-id>-<platform>.png

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/_use-node22.sh"

PROJECT=""
UPDATE=""
for arg in "$@"; do
  case "$arg" in
    --project=mui|--project=radix) PROJECT="${arg#--project=}" ;;
    --update) UPDATE="1" ;;
    *) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

# Build storybook-static (필요한 것만)
ensure_static() {
  local sys="$1"
  local dir="$ROOT/apps/storybook-$sys/storybook-static"
  if [[ ! -f "$dir/index.json" ]]; then
    echo "→ storybook-$sys/storybook-static missing, running sb:build:$sys"
    pnpm --silent sb:build:"$sys"
  fi
}

if [[ -z "$PROJECT" ]]; then
  ensure_static mui
  ensure_static radix
else
  ensure_static "$PROJECT"
fi

PW_ARGS=()
if [[ -n "$PROJECT" ]]; then
  PW_ARGS+=("--project=$PROJECT")
fi
if [[ -n "$UPDATE" ]]; then
  PW_ARGS+=("--update-snapshots")
fi

cd "$ROOT"
exec pnpm exec playwright test --config e2e/visual/playwright.config.ts "${PW_ARGS[@]}"
