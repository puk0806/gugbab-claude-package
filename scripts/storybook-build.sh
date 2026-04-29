#!/usr/bin/env bash
# Build the Storybook static site for one of the system showcases.
#
# Output:
#   apps/storybook-mui/storybook-static/    (when system = mui)
#   apps/storybook-radix/storybook-static/  (when system = radix)
#
# Pre-builds workspace dependencies (tokens, react, styled-mui|styled-radix)
# so Storybook resolves their dist/ artifacts via package exports.
#
# Usage:
#   pnpm sb:build:mui                       # build deps + storybook-mui
#   pnpm sb:build:radix                     # build deps + storybook-radix
#   bash scripts/storybook-build.sh mui --skip-deps   # only build the storybook

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

system="${1:-}"
shift || true
case "$system" in
  mui)   pkg="@gugbab-ui/storybook-mui";   styled_pkg="@gugbab-ui/styled-mui"   ;;
  radix) pkg="@gugbab-ui/storybook-radix"; styled_pkg="@gugbab-ui/styled-radix" ;;
  *)
    echo "✘ Usage: $0 <mui|radix> [--skip-deps] [<storybook args>]"
    exit 1
    ;;
esac

# shellcheck source=./_use-node22.sh
. "$repo_root/scripts/_use-node22.sh"

skip_deps=0
forward_args=()
for arg in "$@"; do
  case "$arg" in
    --skip-deps) skip_deps=1 ;;
    *) forward_args+=("$arg") ;;
  esac
done

if [ "$skip_deps" -eq 0 ]; then
  echo "→ Building workspace dependencies (tokens, react, $styled_pkg)"
  pnpm -F @gugbab-ui/tokens \
       -F @gugbab-ui/react \
       -F "$styled_pkg" \
       build
fi

echo "→ Building $pkg static site"
pnpm -F "$pkg" build ${forward_args[@]+"${forward_args[@]}"}

case "$system" in
  mui)   echo "✓ Output: apps/storybook-mui/storybook-static/"   ;;
  radix) echo "✓ Output: apps/storybook-radix/storybook-static/" ;;
esac
