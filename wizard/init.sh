#!/usr/bin/env bash
# wizard/init.sh — materializes the SDD destination for a project.
#
# Usage:
#   wizard/init.sh embedded <target-path> ""             [copy-list-file]
#   wizard/init.sh separate <target-path> <project-name> [copy-list-file]
#   wizard/init.sh external <target-path> <sdd-path>     [copy-list-file]
#
#   embedded  -> <target-path>/.sdd
#   separate  -> <target-path>/<project-name>-sdd        (sibling of the repo)
#   external  -> <sdd-path>                              (absolute or ~-relative,
#                fully outside the repo tree; created if missing)
#
#   copy-list-file: optional path to a file with "<source>\t<dest>" lines —
#     source relative to wizard/ (this script's directory), dest relative
#     to the SDD destination. Each pair is copied after the base structure
#     is created.
#
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Usage:
  wizard/init.sh embedded <target-path> ""             [copy-list-file]
  wizard/init.sh separate <target-path> <project-name> [copy-list-file]
  wizard/init.sh external <target-path> <sdd-path>     [copy-list-file]
USAGE
}

MODE="${1:-}"
TARGET_PATH="${2:-}"
THIRD="${3:-}"
COPY_LIST="${4:-}"

case "$MODE" in
  embedded|separate|external) ;;
  *) usage; exit 1 ;;
esac

if [[ -z "$TARGET_PATH" ]]; then
  echo "Error: target-path is required" >&2
  exit 1
fi

if [[ ! -d "$TARGET_PATH" ]]; then
  echo "Error: target-path does not exist or is not a directory: $TARGET_PATH" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXCALIBUR_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_ABS="$(cd "$TARGET_PATH" && pwd)"

case "$MODE" in
  embedded)
    if [[ -n "$THIRD" ]]; then
      echo "Error: embedded mode takes no project-name; pass an empty string as the 3rd argument if you need a 4th (copy-list-file) argument" >&2
      exit 1
    fi
    DEST="$TARGET_ABS/.sdd"
    ;;
  separate)
    if [[ -z "$THIRD" ]]; then
      echo "Error: project-name is required when mode=separate" >&2
      exit 1
    fi
    DEST="$TARGET_ABS/${THIRD}-sdd"
    ;;
  external)
    if [[ -z "$THIRD" ]]; then
      echo "Error: sdd-path is required when mode=external" >&2
      exit 1
    fi
    # Expand a leading ~ ourselves: the path usually arrives quoted from the agent,
    # so the shell never expands it.
    DEST="${THIRD/#\~/$HOME}"
    if [[ "$DEST" != /* && "$DEST" != [A-Za-z]:* ]]; then
      echo "Error: external mode needs an absolute path (got: $THIRD)" >&2
      exit 1
    fi
    ;;
esac

if [[ -n "$COPY_LIST" && ! -f "$COPY_LIST" ]]; then
  echo "Error: copy-list file not found: $COPY_LIST" >&2
  exit 3
fi

if [[ -e "$DEST" ]]; then
  echo "Error: destination already exists: $DEST" >&2
  exit 2
fi

# In external mode the destination lives outside the repo, so its parent may not
# exist yet — that is the normal case, not an error.
mkdir -p "$DEST/specs" "$DEST/ideas" "$DEST/architecture" "$DEST/Templates" "$DEST/reflection"
cp "$EXCALIBUR_ROOT/pipeline/spec-template.md" "$DEST/Templates/spec-template.md"
cp "$EXCALIBUR_ROOT/pipeline/handoff-template.md" "$DEST/Templates/handoff-template.md"
cp "$EXCALIBUR_ROOT/reflection/when-to-pause.md" "$DEST/reflection/when-to-pause.md"
cp "$EXCALIBUR_ROOT/reflection/reasoning-chain.md" "$DEST/reflection/reasoning-chain.md"
# JSON Canvas is an open format (plain JSON), so this is just a seed file the review
# agent keeps current — the Obsidian app is never involved in writing it.
cp "$EXCALIBUR_ROOT/pipeline/project-canvas-template.canvas" "$DEST/project.canvas"
touch "$DEST/specs/.gitkeep" "$DEST/ideas/.gitkeep" "$DEST/architecture/.gitkeep"
# Empty marker so a renamed/moved SDD folder can still be found later by scanning
# for this file instead of guessing by folder name — see pipeline/sdd-path-recovery.md.
touch "$DEST/.excalibur-sdd-marker"

if [[ -n "$COPY_LIST" ]]; then
  while IFS=$'\t' read -r SRC DST || [[ -n "$SRC" ]]; do
    SRC="${SRC%$'\r'}"
    DST="${DST%$'\r'}"
    [[ -z "$SRC" ]] && continue
    mkdir -p "$(dirname "$DEST/$DST")"
    cp "$SCRIPT_DIR/$SRC" "$DEST/$DST"
  done < "$COPY_LIST"
fi

# external mode keeps the SDD outside the repo on purpose, so there is nothing to
# ignore. The other two modes sit inside the tree and only need an entry when the
# user asked for the history to stay out of version control.
if [[ "$MODE" != "external" ]]; then
  echo "Note: if history should stay out of version control, add 'history.yaml' to .gitignore"
fi

echo "Created SDD destination at: $DEST"
