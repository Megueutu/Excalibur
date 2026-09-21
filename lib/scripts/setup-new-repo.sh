#!/usr/bin/env bash
# lib/scripts/setup-new-repo.sh — finishes setting up a brand-new GitHub repo,
# right after lib/scripts/create-github-repo.sh, branching on `github_preset`
# from wizard/manifest.yaml (values: conservative/direct/custom).
#
# Usage: lib/scripts/setup-new-repo.sh <path> <repo-name> <conservative|direct|custom> [description]
# Requires: gh installed and authenticated (see check-gh.sh); <path> must already
#   be a git repository with a GitHub remote (see create-github-repo.sh).
# Exit codes: 0 = done, 1 = bad args, 2 = gh not available/authenticated,
#   3 = not a git repository
#
# Behavior by preset:
#   conservative -> base config, then a ruleset requiring a PR before merging to
#                   the default branch, plus a .github/pull_request_template.md
#                   pointing reviewers at the Excalibur task structure.
#   direct       -> base config only. No ruleset, by design — no bureaucracy for
#                   this preset.
#   custom       -> base config only. Deliberate no-op beyond that: the manifest's
#                   `custom` option is open-ended free text with no fixed script
#                   behavior yet (see wizard/manifest.yaml, github_preset).
set -euo pipefail

TARGET_PATH="${1:-}"
REPO_NAME="${2:-}"
PRESET="${3:-}"
DESCRIPTION="${4:-}"

if [[ -z "$TARGET_PATH" || -z "$REPO_NAME" ]]; then
  echo "Usage: lib/scripts/setup-new-repo.sh <path> <repo-name> <conservative|direct|custom> [description]" >&2
  exit 1
fi

case "$PRESET" in
  conservative|direct|custom) ;;
  *)
    echo "Usage: lib/scripts/setup-new-repo.sh <path> <repo-name> <conservative|direct|custom> [description]" >&2
    exit 1
    ;;
esac

if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh not installed or not authenticated — run check-gh.sh first" >&2
  exit 2
fi

if [[ ! -e "$TARGET_PATH/.git" ]]; then
  echo "Error: not a git repository (no .git at this exact path): $TARGET_PATH" >&2
  exit 3
fi

DEFAULT_BRANCH="$(git -C "$TARGET_PATH" branch --show-current)"
if [[ -z "$DEFAULT_BRANCH" ]]; then
  DEFAULT_BRANCH="main"
fi

# --- 6.1 base config (all presets) ---------------------------------------
if [[ -n "$DESCRIPTION" ]]; then
  gh repo edit "$REPO_NAME" --description "$DESCRIPTION" >/dev/null
fi
gh repo edit "$REPO_NAME" --default-branch "$DEFAULT_BRANCH" >/dev/null 2>&1 || true
echo "Base config applied to $REPO_NAME (default branch: $DEFAULT_BRANCH)"

case "$PRESET" in
  conservative)
    # --- 6.2 conservative: require a PR before merging to the default branch ---
    RULESET_PAYLOAD=$(cat <<JSON
{
  "name": "require-pull-request",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/$DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "pull_request", "parameters": { "required_approving_review_count": 0 } }
  ]
}
JSON
)
    if echo "$RULESET_PAYLOAD" | gh api "repos/$REPO_NAME/rulesets" --input - >/dev/null 2>&1; then
      echo "Created ruleset: PR required before merging to $DEFAULT_BRANCH"
    else
      echo "Warning: could not create the branch ruleset via gh api (insufficient permissions or plan) — continuing" >&2
    fi

    TEMPLATE_DIR="$TARGET_PATH/.github"
    TEMPLATE_FILE="$TEMPLATE_DIR/pull_request_template.md"
    if [[ ! -e "$TEMPLATE_FILE" ]]; then
      mkdir -p "$TEMPLATE_DIR"
      cat > "$TEMPLATE_FILE" <<'MD'
## What changed

## Where to look

This project follows Excalibur's SDD structure. Before reviewing the diff, check
the task's own documents for intent and context:

- `proposal.md` — why this task exists
- `spec.md` — what it must do
- `design.md` — how it's built
- `tasks.yaml` — the checklist this PR closes items against

## Checklist

- [ ] Matches `spec.md`
- [ ] `tasks.yaml` updated for the items this PR closes
MD
      git -C "$TARGET_PATH" add .github/pull_request_template.md
      if ! git -C "$TARGET_PATH" diff --cached --quiet; then
        git -C "$TARGET_PATH" commit -m "chore: add PR template" >/dev/null
        git -C "$TARGET_PATH" push origin "$DEFAULT_BRANCH" >/dev/null 2>&1 || \
          echo "Warning: could not push the PR template commit — push it manually" >&2
      fi
      echo "Added .github/pull_request_template.md"
    else
      echo "PR template already present, left untouched: $TEMPLATE_FILE"
    fi
    ;;
  direct)
    # --- 6.3 direct: no ruleset, by design ---
    echo "Preset is direct: skipping ruleset creation (no bureaucracy for this preset)"
    ;;
  custom)
    # --- 6.4 custom: deferred, no fixed behavior yet ---
    echo "Preset is custom: no additional repo setup performed (open-ended preset, see git.md)"
    ;;
esac
