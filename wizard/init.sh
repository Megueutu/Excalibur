#!/usr/bin/env bash
# wizard/init.sh — materializes the SDD destination for a project.
# Usage: wizard/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]
#   copy-list-file: optional path to a file with "<source>\t<dest>" lines —
#     source relative to wizard/ (this script's directory), dest relative
#     to the SDD destination. Each pair is copied after the base structure
#     is created.
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

MODE="${1:-}"
TARGET_PATH="${2:-}"

if [[ "$MODE" != "embedded" && "$MODE" != "separate" ]]; then
  echo "Usage: wizard/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]" >&2
  exit 1
fi

if [[ "$MODE" == "separate" ]]; then
  PROJECT_NAME="${3:-}"
else
  if [[ -n "${3:-}" ]]; then
    echo "Error: embedded mode takes no project-name; pass an empty string as the 3rd argument if you need a 4th (copy-list-file) argument" >&2
    exit 1
  fi
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

if [[ -n "$COPY_LIST" && ! -f "$COPY_LIST" ]]; then
  echo "Error: copy-list file not found: $COPY_LIST" >&2
  exit 3
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
  while IFS=$'\t' read -r SRC DST || [[ -n "$SRC" ]]; do
    SRC="${SRC%$'\r'}"
    DST="${DST%$'\r'}"
    [[ -z "$SRC" ]] && continue
    mkdir -p "$(dirname "$DEST/$DST")"
    cp "$SCRIPT_DIR/$SRC" "$DEST/$DST"
  done < "$COPY_LIST"
fi

echo "Created SDD destination at: $DEST"
