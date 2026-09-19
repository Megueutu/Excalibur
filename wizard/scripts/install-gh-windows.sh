#!/usr/bin/env bash
# wizard/scripts/install-gh-windows.sh — installs the latest GitHub CLI via winget.
# Usage: wizard/scripts/install-gh-windows.sh
set -euo pipefail

if ! command -v winget >/dev/null 2>&1; then
  echo "Error: winget not found. Install it from the Microsoft Store (App Installer) first." >&2
  exit 1
fi

winget install --id GitHub.cli --source winget --accept-package-agreements --accept-source-agreements
