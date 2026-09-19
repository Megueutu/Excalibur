#!/usr/bin/env bash
# wizard/scripts/convert-history.sh — converts task history into a compact digest.
#
# Usage: wizard/scripts/convert-history.sh <sdd-destination> [output-file]
#   Default output: <sdd-destination>/history-digest.yaml
#
# Why this exists: the working format of the history (what agents append during a
# task, one entry per change, one file per task) is not the right format for reading
# it back later. This produces the reading format — one file, one record per task.
#
# The output is built FOR AN AGENT TO READ, not for a human. That sets the design
# criterion: a fixed schema, no free prose, nothing ambiguous — so a later reader
# cannot hallucinate meaning into a loosely shaped record. It is also what makes it
# worth versioning, for projects that chose to keep history in git.
set -euo pipefail

DEST="${1:-}"
OUT="${2:-}"

if [[ -z "$DEST" || ! -d "$DEST" ]]; then
  echo "Usage: wizard/scripts/convert-history.sh <sdd-destination> [output-file]" >&2
  exit 1
fi

OUT="${OUT:-$DEST/history-digest.yaml}"
TODAY="$(date +%Y-%m-%d)"

mapfile -t FILES < <(find "$DEST" -name history.yaml -not -path "*/archive/*" | sort)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No history.yaml found under: $DEST" >&2
  exit 0
fi

{
  echo "# Task history digest — generated, do not edit by hand."
  echo "# Regenerate with: wizard/scripts/convert-history.sh <sdd-destination>"
  echo "#"
  echo "# Fixed schema, written for an agent to read: one record per task, no free prose."
  echo "# Source of truth stays in each task's own history.yaml."
  echo "version: 1"
  echo "generated: $TODAY"
  echo "tasks:"
} > "$OUT"

for FILE in "${FILES[@]}"; do
  TASK_DIR="$(dirname "$FILE")"
  TASK="$(basename "$TASK_DIR")"
  # The path relative to the destination is what identifies a task unambiguously —
  # two repos can each have a task named "auth".
  REL="${TASK_DIR#"$DEST"}"
  REL="${REL#/}"
  REL="${REL:-.}"

  ENTRIES=$(grep -c '^  - date:' "$FILE" || true)
  FIRST=$(grep -m1 '^  - date:' "$FILE" | sed 's/^  - date: *//' || true)
  LAST=$(grep '^  - date:' "$FILE" | tail -1 | sed 's/^  - date: *//' || true)
  # A task's outcome is the last checklist result recorded for it.
  RESULT=$(grep '^    checklist:' "$FILE" | tail -1 | sed 's/^    checklist: *//' || true)

  {
    echo "  - task: '$TASK'"
    echo "    path: '$REL'"
    echo "    entries: ${ENTRIES:-0}"
    [[ -n "$FIRST" ]]  && echo "    first: '$FIRST'"
    [[ -n "$LAST" ]]   && echo "    last: '$LAST'"
    [[ -n "$RESULT" ]] && echo "    checklist: $RESULT"
  } >> "$OUT"
done

echo "Wrote digest for ${#FILES[@]} task(s): $OUT"
