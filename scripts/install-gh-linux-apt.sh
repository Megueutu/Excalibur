#!/usr/bin/env bash
# scripts/install-gh-linux-apt.sh — installs the latest GitHub CLI via apt (Debian/Ubuntu).
# Usage: scripts/install-gh-linux-apt.sh
# Follows the official install steps from https://github.com/cli/cli/blob/trunk/docs/install_linux.md
set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "Error: apt-get not found on this system." >&2
  exit 1
fi

(type -p wget >/dev/null || (sudo apt-get update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && KEYRING_TMP="$(mktemp)" \
  && wget -nv -O "$KEYRING_TMP" https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat "$KEYRING_TMP" | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && rm -f "$KEYRING_TMP" \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt-get update \
  && sudo apt-get install gh -y
