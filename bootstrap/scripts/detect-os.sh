#!/usr/bin/env bash
# bootstrap/scripts/detect-os.sh — prints one of: windows | macos | linux-apt | linux-dnf | unknown
# Usage: bootstrap/scripts/detect-os.sh
set -euo pipefail

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    echo "windows"
    ;;
  Darwin)
    echo "macos"
    ;;
  Linux)
    if command -v apt-get >/dev/null 2>&1; then
      echo "linux-apt"
    elif command -v dnf >/dev/null 2>&1; then
      echo "linux-dnf"
    else
      echo "unknown"
    fi
    ;;
  *)
    echo "unknown"
    ;;
esac
