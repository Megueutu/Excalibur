#!/usr/bin/env bash
# wizard/scripts/scan-spec-freshness.sh — deterministic sweep for specs that may have drifted
# from the code they describe. No LLM involved: everything here is a commit/tag/date check.
# Judging whether a candidate is real drift or noise is `docs-updater`'s job
# (lib/agents/docs-updater.yaml), not this script's.
#
# Usage:
#   wizard/scripts/scan-spec-freshness.sh <sdd-path> [--repo <git-repo-path>] \
#       [--age-threshold-days N] [--output <file>]
#
# <sdd-path>            Folder containing specs/<repo>/<task-slug>/spec.md files
#                        (the SDD destination — see pipeline/spec-template.md).
# --repo <path>          Git repository to check commits/tags against. Defaults to <sdd-path>
#                        itself (the "embedded" destination case, where SDD and code share a repo).
# --age-threshold-days   Flag a spec whose last_updated is older than this even with no other
#                        signal. Default 90 — a spec nobody has touched in a quarter is worth a
#                        second look regardless of commit activity.
# --output <file>        Write the YAML candidate list there instead of stdout.
#
# Output: a YAML list, one entry per candidate, each with the spec path and every reason it was
# flagged. A spec with no reason to flag is not in the list at all — silence is the "fresh" case.
# Always exits 0: "found no candidates" is a valid, common answer, not a failure.
set -euo pipefail

SDD_PATH="${1:-}"
shift || true

REPO_PATH=""
AGE_THRESHOLD_DAYS=90
OUTPUT_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)                REPO_PATH="${2:-}"; shift 2 ;;
    --age-threshold-days)  AGE_THRESHOLD_DAYS="${2:-}"; shift 2 ;;
    --output)              OUTPUT_FILE="${2:-}"; shift 2 ;;
    *) echo "Error: unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$SDD_PATH" || ! -d "$SDD_PATH" ]]; then
  echo "Usage: wizard/scripts/scan-spec-freshness.sh <sdd-path> [--repo <path>] [--age-threshold-days N] [--output <file>]" >&2
  exit 1
fi

REPO_PATH="${REPO_PATH:-$SDD_PATH}"
IS_GIT_REPO=0
if [[ -e "$REPO_PATH/.git" ]] && git -C "$REPO_PATH" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  IS_GIT_REPO=1
fi

TODAY_EPOCH="$(date +%s)"

# Pulls a single frontmatter scalar field out of a spec.md — good enough for the flat
# "key: value" shape these files use; nothing here parses nested YAML.
frontmatter_field() {
  local file="$1" key="$2"
  awk -v key="$key" '
    /^---$/ { fm++; next }
    fm == 1 && $0 ~ "^" key ":" {
      sub("^" key ":[ \t]*", "");
      gsub(/[ \t]+#.*$/, "");
      gsub(/^["'\'']|["'\'']$/, "");
      print;
      exit
    }
  ' "$file"
}

# depends_on is the one list-valued field; collected as a flat, comma-joined string.
frontmatter_depends_on() {
  local file="$1"
  awk '
    /^---$/ { fm++; next }
    fm == 1 && /^depends_on:/ { in_list = 1; sub(/^depends_on:[ \t]*/, ""); rest = $0 }
    fm == 1 && in_list && /^depends_on:/ {
      if (rest ~ /\[/) { gsub(/[\[\]]/, "", rest); print rest; in_list = 0; next }
    }
    fm == 1 && in_list && /^[ \t]*-/ { sub(/^[ \t]*-[ \t]*/, ""); print; next }
    fm == 1 && in_list && /^[a-zA-Z_]/ && !/^depends_on:/ { in_list = 0 }
  ' "$file" | tr -d "'\"" | paste -sd, -
}

# Best-effort list of files/folders this spec is about, from the sibling design.md's
# "Affected files" section (pipeline/spec-template.md). Falls back to the task folder
# itself when there is no design.md yet — a spec without a design still deserves an
# age/tag/depends_on check even if it can't be tied to specific paths.
referenced_paths() {
  local task_dir="$1" design="$task_dir/design.md"
  if [[ -f "$design" ]]; then
    awk '
      /^## Affected files/ { in_section = 1; next }
      in_section && /^## / { in_section = 0 }
      in_section { print }
    ' "$design" | grep -oE '`[^`]+`' | tr -d '`' | sort -u
  fi
}

days_between() {
  local date_str="$1" epoch
  epoch="$(date -d "$date_str" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$date_str" +%s 2>/dev/null || echo "")"
  [[ -z "$epoch" ]] && { echo ""; return; }
  echo $(( (TODAY_EPOCH - epoch) / 86400 ))
}

CANDIDATES=()

while IFS= read -r spec_file; do
  task_dir="$(dirname "$spec_file")"
  spec_id="$(frontmatter_field "$spec_file" spec_id)"
  [[ -z "$spec_id" ]] && spec_id="$(basename "$task_dir")"
  status="$(frontmatter_field "$spec_file" status)"
  last_updated="$(frontmatter_field "$spec_file" last_updated)"
  linked_commit="$(frontmatter_field "$spec_file" linked_commit)"
  depends_on="$(frontmatter_depends_on "$spec_file")"

  [[ "$status" == "obsolete" ]] && continue

  reasons=()

  # Age threshold — the one check that needs no git at all.
  if [[ -n "$last_updated" ]]; then
    age_days="$(days_between "$last_updated")"
    if [[ -n "$age_days" && "$age_days" -gt "$AGE_THRESHOLD_DAYS" ]]; then
      reasons+=("age: last_updated is ${age_days}d old (threshold ${AGE_THRESHOLD_DAYS}d)")
    fi
  fi

  if [[ "$IS_GIT_REPO" -eq 1 ]]; then
    # Commits touching the spec's referenced files since linked_commit.
    if [[ -n "$linked_commit" ]] && git -C "$REPO_PATH" cat-file -e "${linked_commit}^{commit}" 2>/dev/null; then
      mapfile -t paths < <(referenced_paths "$task_dir")
      if [[ "${#paths[@]}" -gt 0 ]]; then
        commit_count="$(git -C "$REPO_PATH" log --oneline "${linked_commit}..HEAD" -- "${paths[@]}" 2>/dev/null | wc -l | tr -d ' ')"
        if [[ "${commit_count:-0}" -gt 0 ]]; then
          reasons+=("commits: ${commit_count} commit(s) touching referenced paths since ${linked_commit}")
        fi
      fi
    fi

    # Releases/tags newer than last_updated.
    if [[ -n "$last_updated" ]]; then
      newer_tags="$(git -C "$REPO_PATH" for-each-ref --sort=-creatordate --format='%(refname:short) %(creatordate:short)' refs/tags 2>/dev/null \
        | awk -v cutoff="$last_updated" '$2 > cutoff { print $1 }')"
      if [[ -n "$newer_tags" ]]; then
        tag_count="$(echo "$newer_tags" | wc -l | tr -d ' ')"
        reasons+=("release: ${tag_count} tag(s) newer than last_updated ($(echo "$newer_tags" | head -1))")
      fi
    fi
  fi

  # depends_on staleness: another spec's freshness_check is stale, or it moved more recently.
  if [[ -n "$depends_on" ]]; then
    IFS=',' read -ra dep_ids <<< "$depends_on"
    for dep_id in "${dep_ids[@]}"; do
      dep_id="$(echo "$dep_id" | xargs)"
      [[ -z "$dep_id" ]] && continue
      dep_file="$(grep -rl "^spec_id: *${dep_id}$" "$SDD_PATH" --include=spec.md 2>/dev/null | head -1 || true)"
      [[ -z "$dep_file" ]] && continue
      dep_freshness="$(frontmatter_field "$dep_file" freshness_check)"
      dep_updated="$(frontmatter_field "$dep_file" last_updated)"
      if [[ "$dep_freshness" == "stale" ]]; then
        reasons+=("depends_on: '${dep_id}' is itself flagged stale")
      elif [[ -n "$dep_updated" && -n "$last_updated" && "$dep_updated" > "$last_updated" ]]; then
        reasons+=("depends_on: '${dep_id}' was updated (${dep_updated}) more recently than this spec (${last_updated})")
      fi
    done
  fi

  if [[ "${#reasons[@]}" -gt 0 ]]; then
    entry="  - spec: $spec_file"$'\n'"    spec_id: $spec_id"$'\n'"    reasons:"
    for r in "${reasons[@]}"; do
      entry+=$'\n'"      - \"${r//\"/\\\"}\""
    done
    CANDIDATES+=("$entry")
  fi
done < <(find "$SDD_PATH" -type f -name spec.md | sort)

{
  echo "# Candidates for spec-freshness review — generated by scan-spec-freshness.sh."
  echo "# Deterministic output only: no candidate here has been judged real drift yet."
  echo "# See lib/agents/docs-updater.yaml for the judgment step."
  echo "version: 1"
  echo "generated: $(date +%Y-%m-%d)"
  echo "candidates:"
  if [[ "${#CANDIDATES[@]}" -eq 0 ]]; then
    echo "  []"
  else
    for c in "${CANDIDATES[@]}"; do
      echo "$c"
    done
  fi
} > "${OUTPUT_FILE:-/dev/stdout}"

if [[ -n "$OUTPUT_FILE" ]]; then
  echo "Wrote $((${#CANDIDATES[@]})) candidate(s) to: $OUTPUT_FILE" >&2
fi
