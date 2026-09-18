#!/usr/bin/env bash
# bootstrap/scripts/install-gh-macos.sh — installs the latest GitHub CLI via Homebrew.
# Usage: bootstrap/scripts/install-gh-macos.sh
set -euo pipefail

if ! command -v brew >/dev/null 2>&1; then
  echo "Error: brew not found. Install Homebrew first: https://brew.sh" >&2
  exit 1
fi

brew install gh
