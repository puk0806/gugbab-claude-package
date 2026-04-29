#!/usr/bin/env bash
# Source-only helper: prepends a Storybook-compatible Node toolchain to PATH.
#
# Storybook 10 requires Node >=20.19 or >=22.12. The repo's .nvmrc still pins
# 20.17 for backward compatibility, so anything that touches Storybook
# explicitly opts into a newer Node here.
#
# Resolution order:
#   1. NODE_BIN env override (absolute path to a node bin dir)
#   2. nvm: latest installed 22.x (preferred) or 20.19+
#   3. system `node` if it already satisfies (>=20.19 or >=22.12)

set -euo pipefail

_min_satisfies() {
  # $1 = full version like "v20.17.0"; returns 0 if Storybook 10 compatible
  local v="${1#v}"
  local major minor
  major="${v%%.*}"
  minor="${v#*.}"
  minor="${minor%%.*}"
  if [ "$major" -ge 22 ] && [ "$minor" -ge 12 ]; then return 0; fi
  if [ "$major" -ge 20 ] && [ "$minor" -ge 19 ]; then return 0; fi
  if [ "$major" -ge 21 ]; then return 0; fi  # 21.x always satisfies
  return 1
}

_pick_from_nvm() {
  local nvm_node_dir="${NVM_DIR:-$HOME/.nvm}/versions/node"
  [ -d "$nvm_node_dir" ] || return 1
  # Prefer latest 22.x
  local cand
  cand=$(ls -1 "$nvm_node_dir" 2>/dev/null | grep -E '^v22\.' | sort -V | tail -1 || true)
  if [ -n "$cand" ] && _min_satisfies "$cand"; then
    echo "$nvm_node_dir/$cand/bin"; return 0
  fi
  # Fall back to latest 20.19+
  cand=$(ls -1 "$nvm_node_dir" 2>/dev/null | grep -E '^v20\.' | sort -V | tail -1 || true)
  if [ -n "$cand" ] && _min_satisfies "$cand"; then
    echo "$nvm_node_dir/$cand/bin"; return 0
  fi
  # Fall back to latest 21.x or 23.x
  cand=$(ls -1 "$nvm_node_dir" 2>/dev/null | grep -E '^v(21|23)\.' | sort -V | tail -1 || true)
  if [ -n "$cand" ] && _min_satisfies "$cand"; then
    echo "$nvm_node_dir/$cand/bin"; return 0
  fi
  return 1
}

_resolve_bin() {
  if [ -n "${NODE_BIN:-}" ] && [ -x "$NODE_BIN/node" ]; then
    echo "$NODE_BIN"; return 0
  fi
  if bin=$(_pick_from_nvm); then
    echo "$bin"; return 0
  fi
  if command -v node >/dev/null 2>&1; then
    local sysv
    sysv=$(node --version)
    if _min_satisfies "$sysv"; then
      dirname "$(command -v node)"; return 0
    fi
  fi
  return 1
}

if bin=$(_resolve_bin); then
  export PATH="$bin:$PATH"
  echo "→ Using Node $("$bin/node" --version) (Storybook 10 compatible)" >&2
else
  cat >&2 <<'MSG'
✘ Storybook 10 requires Node >=20.19 or >=22.12, but no compatible toolchain was found.

Install one of:
  nvm install 22
  nvm install 20.19.0

Or set NODE_BIN to an absolute bin/ dir:
  NODE_BIN=/path/to/node-v22/bin pnpm sb:dev
MSG
  exit 1
fi
