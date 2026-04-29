#!/usr/bin/env bash
# Run the headless visual check against a running Storybook dev server.
#
# Usage:
#   bash scripts/visual-check.sh                    # default base http://localhost:6006
#   bash scripts/visual-check.sh --base http://localhost:6007 --only foundations
#
# Forwards all args to scripts/visual-check.mjs.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

# shellcheck source=./_use-node22.sh
. "$repo_root/scripts/_use-node22.sh"

exec node scripts/visual-check.mjs "$@"
