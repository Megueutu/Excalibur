#!/usr/bin/env bash
# scripts/init-git-repo.sh — initializes a git repository at the given path.
# Usage: scripts/init-git-repo.sh <path>
# Exit codes: 0 = initialized, 1 = bad args, 2 = already a git repository
set -euo pipefail

TARGET_PATH="${1:-}"

if [[ -z "$TARGET_PATH" ]]; then
  echo "Usage: scripts/init-git-repo.sh <path>" >&2
  exit 1
fi

if [[ ! -d "$TARGET_PATH" ]]; then
  echo "Error: path does not exist or is not a directory: $TARGET_PATH" >&2
  exit 1
fi

if [[ -e "$TARGET_PATH/.git" ]]; then
  echo "Error: already a git repository: $TARGET_PATH" >&2
  exit 2
fi

git -C "$TARGET_PATH" init
echo "Initialized git repository at: $TARGET_PATH"
