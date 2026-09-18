#!/usr/bin/env bash
# bootstrap/scripts/create-github-repo.sh — creates a GitHub repository for an existing local repo.
# Usage: bootstrap/scripts/create-github-repo.sh <path> <name> <public|private>
# Requires: gh installed and authenticated (see check-gh.sh).
# Exit codes: 0 = created, 1 = bad args, 2 = gh not available/authenticated, 3 = not a git repository
set -euo pipefail

TARGET_PATH="${1:-}"
REPO_NAME="${2:-}"
VISIBILITY="${3:-}"

if [[ -z "$TARGET_PATH" || -z "$REPO_NAME" || ( "$VISIBILITY" != "public" && "$VISIBILITY" != "private" ) ]]; then
  echo "Usage: bootstrap/scripts/create-github-repo.sh <path> <name> <public|private>" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh not installed or not authenticated — run check-gh.sh first" >&2
  exit 2
fi

if [[ ! -e "$TARGET_PATH/.git" ]]; then
  echo "Error: not a git repository (no .git at this exact path): $TARGET_PATH" >&2
  exit 3
fi

gh repo create "$REPO_NAME" --"$VISIBILITY" --source="$TARGET_PATH" --remote=origin
echo "Created GitHub repository: $REPO_NAME ($VISIBILITY)"
