#!/usr/bin/env bash
# bootstrap/init.sh — materializes the SDD destination for a project.
# Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]
#   copy-list-file: optional path to a file with "<source>\t<dest>" lines —
#     source relative to the Excalibur root, dest relative to the SDD
#     destination. Each pair is copied after the base structure is created.
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

MODE="${1:-}"
TARGET_PATH="${2:-}"

if [[ "$MODE" != "embedded" && "$MODE" != "separate" ]]; then
  echo "Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]" >&2
  exit 1
fi

if [[ "$MODE" == "separate" ]]; then
  PROJECT_NAME="${3:-}"
else
  PROJECT_NAME=""
fi
COPY_LIST="${4:-}"

if [[ -z "$TARGET_PATH" ]]; then
  echo "Error: target-path is required" >&2
  exit 1
fi

if [[ "$MODE" == "separate" && -z "$PROJECT_NAME" ]]; then
  echo "Error: project-name is required when mode=separate" >&2
  exit 1
fi

if [[ ! -d "$TARGET_PATH" ]]; then
  echo "Error: target-path does not exist or is not a directory: $TARGET_PATH" >&2
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
cp "$EXCALIBUR_ROOT/reflection/when-to-pause.md" "$DEST/reflection/when-to-pause.md"
touch "$DEST/specs/.gitkeep"

if [[ -n "$COPY_LIST" ]]; then
  if [[ ! -f "$COPY_LIST" ]]; then
    echo "Error: copy-list file not found: $COPY_LIST" >&2
    exit 3
  fi
  while IFS=$'\t' read -r SRC DST || [[ -n "$SRC" ]]; do
    [[ -z "$SRC" ]] && continue
    mkdir -p "$(dirname "$DEST/$DST")"
    cp "$EXCALIBUR_ROOT/$SRC" "$DEST/$DST"
  done < "$COPY_LIST"
fi

echo "Created SDD destination at: $DEST"
