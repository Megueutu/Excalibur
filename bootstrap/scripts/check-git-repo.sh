#!/usr/bin/env bash
# bootstrap/scripts/check-git-repo.sh — checks whether a path is itself the root of a git repository (has its own .git).
# Deliberately does NOT use `git rev-parse --is-inside-work-tree`, which walks up to ancestor
# repos — a project folder nested inside some outer repo (e.g. a dotfiles repo at $HOME) would
# otherwise be reported as "already has a repo" even though it has none of its own.
# Usage: bootstrap/scripts/check-git-repo.sh <path>
# Exit codes: 0 = has its own git repository, 1 = does not, 2 = bad args
set -euo pipefail

TARGET_PATH="${1:-}"

if [[ -z "$TARGET_PATH" ]]; then
  echo "Usage: bootstrap/scripts/check-git-repo.sh <path>" >&2
  exit 2
fi

if [[ ! -d "$TARGET_PATH" ]]; then
  echo "Error: path does not exist or is not a directory: $TARGET_PATH" >&2
  exit 2
fi

if [[ -e "$TARGET_PATH/.git" ]]; then
  echo "git repository found at: $TARGET_PATH"
  exit 0
else
  echo "no git repository at: $TARGET_PATH"
  exit 1
fi
