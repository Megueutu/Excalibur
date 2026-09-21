#!/usr/bin/env bash
# scripts/check-gh.sh — checks whether the GitHub CLI is installed and authenticated.
# Usage: scripts/check-gh.sh
# Exit codes: 0 = installed and authenticated, 1 = installed but not authenticated, 2 = not installed
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh not found"
  exit 2
fi

if gh auth status >/dev/null 2>&1; then
  echo "gh installed and authenticated"
  exit 0
else
  echo "gh installed but not authenticated — run: gh auth login"
  exit 1
fi
