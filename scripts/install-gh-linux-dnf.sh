#!/usr/bin/env bash
# scripts/install-gh-linux-dnf.sh — installs the latest GitHub CLI via dnf (Fedora/RHEL).
# Usage: scripts/install-gh-linux-dnf.sh
# Follows the official install steps from https://github.com/cli/cli/blob/trunk/docs/install_linux.md
set -euo pipefail

if ! command -v dnf >/dev/null 2>&1; then
  echo "Error: dnf not found on this system." >&2
  exit 1
fi

sudo dnf install -y 'dnf-command(config-manager)'
sudo dnf config-manager addrepo --from-repofile=https://cli.github.com/packages/rpm/gh-cli.repo
sudo dnf install -y gh
