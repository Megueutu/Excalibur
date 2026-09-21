#!/usr/bin/env bash
# scripts/record-history.sh — appends one changelog entry to a task's history.yaml.
#
# Usage:
#   scripts/record-history.sh <task-dir> --what <text> --why <text> \
#       [--result <text>] [--checklist pass|fail|skipped] [--agent <name>]
#
# Why a script and not an agent: the history is a mechanical, deterministic record.
# Having an agent format YAML costs tokens on every task and can drift in shape.
# The agent that made the change calls this with its fields; the script owns the format.
#
# The entry is appended, never rewritten — this file is a changelog, not a log of
# granular events, and nothing here interprets or summarizes past entries.
set -euo pipefail

TASK_DIR="${1:-}"
shift || true

WHAT=""
WHY=""
RESULT=""
CHECKLIST=""
AGENT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --what)      WHAT="${2:-}"; shift 2 ;;
    --why)       WHY="${2:-}"; shift 2 ;;
    --result)    RESULT="${2:-}"; shift 2 ;;
    --checklist) CHECKLIST="${2:-}"; shift 2 ;;
    --agent)     AGENT="${2:-}"; shift 2 ;;
    *) echo "Error: unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$TASK_DIR" || ! -d "$TASK_DIR" ]]; then
  echo "Usage: scripts/record-history.sh <task-dir> --what <text> --why <text> [--result <text>] [--checklist pass|fail|skipped] [--agent <name>]" >&2
  exit 1
fi

if [[ -z "$WHAT" || -z "$WHY" ]]; then
  echo "Error: --what and --why are both required" >&2
  exit 1
fi

if [[ -n "$CHECKLIST" && "$CHECKLIST" != "pass" && "$CHECKLIST" != "fail" && "$CHECKLIST" != "skipped" ]]; then
  echo "Error: --checklist must be pass, fail or skipped" >&2
  exit 1
fi

HISTORY="$TASK_DIR/history.yaml"
TODAY="$(date +%Y-%m-%d)"

# Quote as a YAML single-quoted scalar: the only escape that format needs is
# doubling an embedded quote, which keeps this readable without a YAML library.
yaml_str() {
  local s="${1//\'/\'\'}"
  printf "'%s'" "$s"
}

if [[ ! -f "$HISTORY" ]]; then
  {
    echo "# Execution history for this task — a changelog, not an event log."
    echo "# Not read by any agent unless a handoff or the user explicitly asks for it."
    echo "version: 1"
    echo "entries:"
  } > "$HISTORY"
fi

{
  echo "  - date: $TODAY"
  echo "    what: $(yaml_str "$WHAT")"
  echo "    why: $(yaml_str "$WHY")"
  [[ -n "$RESULT" ]]    && echo "    result: $(yaml_str "$RESULT")"
  [[ -n "$CHECKLIST" ]] && echo "    checklist: $CHECKLIST"
  [[ -n "$AGENT" ]]     && echo "    agent: $(yaml_str "$AGENT")"
} >> "$HISTORY"

echo "Recorded entry in: $HISTORY"
