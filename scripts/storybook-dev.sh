#!/usr/bin/env bash
# Start a Storybook 10 dev server for one of the system showcases.
#
# Usage:
#   pnpm sb:dev:mui            # MUI showcase  (port 6006)
#   pnpm sb:dev:radix          # Radix showcase (port 6007)
#   bash scripts/storybook-dev.sh mui -- -p 7006   # forward args (override port, --no-open, …)

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

system="${1:-}"
shift || true
case "$system" in
  mui)   pkg="@gugbab-ui/storybook-mui" ;;
  radix) pkg="@gugbab-ui/storybook-radix" ;;
  *)
    echo "✘ Usage: $0 <mui|radix> [-- <storybook args>]"
    exit 1
    ;;
esac

# shellcheck source=./_use-node22.sh
. "$repo_root/scripts/_use-node22.sh"

exec pnpm -F "$pkg" dev "$@"
