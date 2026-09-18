#!/usr/bin/env bash
# bootstrap/init.sh — materializes the SDD destination for a project.
# Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name]
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

MODE="${1:-}"
TARGET_PATH="${2:-}"
PROJECT_NAME="${3:-}"

if [[ "$MODE" != "embedded" && "$MODE" != "separate" ]]; then
  echo "Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name]" >&2
  exit 1
fi

if [[ -z "$TARGET_PATH" ]]; then
  echo "Error: target-path is required" >&2
  exit 1
fi

if [[ "$MODE" == "separate" && -z "$PROJECT_NAME" ]]; then
  echo "Error: project-name is required when mode=separate" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXCALIBUR_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ "$MODE" == "embedded" ]]; then
  DEST="$TARGET_PATH/.sdd"
else
  DEST="$TARGET_PATH/${PROJECT_NAME}-sdd"
fi

if [[ -e "$DEST" ]]; then
  echo "Error: destination already exists: $DEST" >&2
  exit 2
fi

mkdir -p "$DEST/specs" "$DEST/Templates" "$DEST/reflection"
cp "$EXCALIBUR_ROOT/pipeline/spec-template.md" "$DEST/Templates/spec-template.md"
cp "$EXCALIBUR_ROOT/reflection/reasoning-chain.md" "$DEST/reflection/reasoning-chain.md"

echo "Created SDD destination at: $DEST"
echo "Next: copy the chosen GitHub preset from bootstrap/presets/github/ to $DEST/git.md"
