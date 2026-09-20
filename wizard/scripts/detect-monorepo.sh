#!/usr/bin/env bash
# wizard/scripts/detect-monorepo.sh — detects whether the target project root is a
# monorepo, from marker files that are already on disk, so onboarding doesn't have
# to ask. Informational only: monorepo support itself is still an open question
# (see PENDENCIAS.md item 9) — this script just detects, it doesn't decide anything.
#
# Usage: wizard/scripts/detect-monorepo.sh <target-path>
# Output: two "key=value" lines — monorepo= (true/false) and marker= (the matched
#   file, or "none") — checked in this order: lerna.json, pnpm-workspace.yaml,
#   turbo.json, nx.json. Always exits 0: "not a monorepo" is a valid answer, not a
#   failure, and the caller (the post-manifest interpreter agent) decides what to
#   do with the result.
set -euo pipefail

TARGET="${1:-}"

if [[ -z "$TARGET" || ! -d "$TARGET" ]]; then
  echo "Usage: wizard/scripts/detect-monorepo.sh <target-path>" >&2
  exit 1
fi

has() { [[ -e "$TARGET/$1" ]]; }

MONOREPO="false"
MARKER="none"

if has "lerna.json"; then
  MONOREPO="true"
  MARKER="lerna.json"
elif has "pnpm-workspace.yaml"; then
  MONOREPO="true"
  MARKER="pnpm-workspace.yaml"
elif has "turbo.json"; then
  MONOREPO="true"
  MARKER="turbo.json"
elif has "nx.json"; then
  MONOREPO="true"
  MARKER="nx.json"
fi

echo "monorepo=$MONOREPO"
echo "marker=$MARKER"
