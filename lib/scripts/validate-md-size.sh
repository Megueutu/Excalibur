#!/usr/bin/env bash
# lib/scripts/validate-md-size.sh — mechanical check of .md files under a target
# directory against the allowlist in rules/md-size-limits.yaml.
#
# Model: ALLOWLIST (see that file's own header). Only files matching one of its
# `match` globs are checked; everything else has no limit, by design — this script
# never second-guesses that.
#
# Usage: lib/scripts/validate-md-size.sh <target-dir>
# Output: one line per violation, tab-separated — "<path>\t<actual>\t<limit>\t<type>"
#   — to stdout. Plain text on purpose, easy for a human to skim and trivial for a
#   caller (excalibur lint, the review agent) to split on tabs.
# Exit: 0 when clean, 1 when at least one violation was found, 2 on bad usage/input.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Relative to this script, not to $PWD: this file ships both at the package root
# (lib/scripts/) and materialized into a target project (.excalibur/lib/scripts/)
# — rules/ sits two levels up from either location, so one relative path works for both.
LIMITS_FILE="$SCRIPT_DIR/../../rules/md-size-limits.yaml"
TARGET="${1:-}"

if [[ -z "$TARGET" || ! -d "$TARGET" ]]; then
  echo "Usage: lib/scripts/validate-md-size.sh <target-dir>" >&2
  exit 2
fi

if [[ ! -f "$LIMITS_FILE" ]]; then
  echo "validate-md-size.sh: limits file not found at $LIMITS_FILE" >&2
  exit 2
fi

# Parse the `limits:` list into tab-separated records: type, match, max_lines,
# max_frontmatter_lines (either of the last two may be absent, printed as "-" — bash's
# `read` with IFS=<tab> collapses adjacent tabs like other IFS whitespace, so a truly
# empty field between two tabs would silently vanish and shift the rest). Deliberately
# not a general YAML parser — the file's shape (a flat list of small maps under one
# key) is fixed and simple enough that awk is the honest tool for it, matching the
# project's own minimal-YAML philosophy (see cli/src/lib/yaml.js).
RECORDS="$(awk '
  { gsub(/\r$/, "") }
  function emit() { print type "\t" match_pat "\t" (max_lines=="" ? "-" : max_lines) "\t" (max_fm=="" ? "-" : max_fm) }
  BEGIN { in_limits=0; type=""; match_pat=""; max_lines=""; max_fm=""; have=0 }
  /^limits:/ { in_limits=1; next }
  in_limits && /^[a-zA-Z_]/ {
    if (have) emit()
    exit
  }
  in_limits && /^  - type:/ {
    if (have) emit()
    type=$0; sub(/^  - type: */, "", type); have=1
    match_pat=""; max_lines=""; max_fm=""
    next
  }
  in_limits && /^    match:/ {
    match_pat=$0; sub(/^    match: */, "", match_pat)
    gsub(/^"|"$/, "", match_pat)
    next
  }
  in_limits && /^    max_lines:/ {
    max_lines=$0; sub(/^    max_lines: */, "", max_lines)
    next
  }
  in_limits && /^    max_frontmatter_lines:/ {
    max_fm=$0; sub(/^    max_frontmatter_lines: */, "", max_fm)
    next
  }
  END { if (in_limits && have) emit() }
' "$LIMITS_FILE")"

if [[ -z "$RECORDS" ]]; then
  echo "validate-md-size.sh: no limit records parsed from $LIMITS_FILE" >&2
  exit 2
fi

violations=0

# Frontmatter line count: everything strictly between the first two "---" lines.
frontmatter_lines() {
  awk '
    { gsub(/\r$/, "") }
    /^---[[:space:]]*$/ { n++; if (n==2) exit; if (n==1) next }
    n==1 { count++ }
    END { print count+0 }
  ' "$1"
}

while IFS= read -r -d '' file; do
  relpath="${file#"$TARGET"/}"
  relpath="${relpath#./}"

  while IFS=$'\t' read -r type pattern max_lines max_fm; do
    [[ -z "$type" ]] && continue
    # `**` in the allowlist behaves like a single `*` under case's pattern matching
    # (unlike filename globbing, it is not special-cased to stop at "/" here), which
    # is exactly what these nested patterns need.
    case "$relpath" in
      $pattern)
        if [[ "$max_lines" != "-" ]]; then
          actual="$(wc -l < "$file" | tr -d ' ')"
          if (( actual > max_lines )); then
            printf '%s\t%s\t%s\t%s\n' "$relpath" "$actual" "$max_lines" "$type"
            violations=$((violations + 1))
          fi
        fi
        if [[ "$max_fm" != "-" ]]; then
          actual="$(frontmatter_lines "$file")"
          if (( actual > max_fm )); then
            printf '%s\t%s\t%s\t%s\n' "$relpath" "$actual" "$max_fm" "$type"
            violations=$((violations + 1))
          fi
        fi
        ;;
    esac
  done <<< "$RECORDS"
done < <(find "$TARGET" -type f -name "*.md" -print0)

if (( violations > 0 )); then
  exit 1
fi
exit 0
