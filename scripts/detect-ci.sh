#!/usr/bin/env bash
# scripts/detect-ci.sh — detects whether the target project already has CI/CD
# configured, so the manifest question that asks the same thing doesn't have to be
# asked when it's mechanically detectable. GitHub Actions is the priority (this repo
# targets `gh`/GitHub workflows elsewhere); a few other providers are checked
# because the check is a single cheap file/dir stat, not because this script tries
# to be a general CI detector.
#
# Usage: scripts/detect-ci.sh <target-path>
# Output: two "key=value" lines — ci= (true/false) and provider= (the matched
#   provider, or "none"). Checked in this order: GitHub Actions (.github/workflows/
#   with at least one file in it), GitLab CI (.gitlab-ci.yml), CircleCI
#   (.circleci/config.yml), Travis CI (.travis.yml). Always exits 0: "no CI found"
#   is a valid answer, not a failure.
set -euo pipefail

TARGET="${1:-}"

if [[ -z "$TARGET" || ! -d "$TARGET" ]]; then
  echo "Usage: scripts/detect-ci.sh <target-path>" >&2
  exit 1
fi

CI="false"
PROVIDER="none"

if [[ -d "$TARGET/.github/workflows" ]] && find "$TARGET/.github/workflows" -type f \( -name '*.yml' -o -name '*.yaml' \) -print -quit | grep -q .; then
  CI="true"
  PROVIDER="github_actions"
elif [[ -e "$TARGET/.gitlab-ci.yml" ]]; then
  CI="true"
  PROVIDER="gitlab_ci"
elif [[ -e "$TARGET/.circleci/config.yml" ]]; then
  CI="true"
  PROVIDER="circleci"
elif [[ -e "$TARGET/.travis.yml" ]]; then
  CI="true"
  PROVIDER="travis"
fi

echo "ci=$CI"
echo "provider=$PROVIDER"
