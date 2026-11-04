#!/usr/bin/env bash
# End-to-end smoke test: pack the package, install it in a throwaway project and
# run the commands that must always work. Exits non-zero on the first failure.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$WORK"
mkdir pack project
(cd pack && npm pack "$ROOT" --silent >/dev/null)

cd project
git init -q
echo '{"name":"smoke","version":"1.0.0"}' > package.json
npm install --silent --save-dev ../pack/*.tgz

run() { echo "-- excalibur $*"; npx --no-install excalibur "$@" </dev/null; }

run init --yes
run status
run doctor
run budget
run lint
run module list
run module add obsidian
test -f .overrides/context/obsidian.md
run module remove obsidian
run module add graphify
test -f .claude/skills/graph-index/ab-protocol.md
run budget --json
run module remove graphify
run mode vibecode
test -f .claude/skills/decision-log/SKILL.md
test -f .overrides/context/mode.md
run update
test -f .overrides/context/mode.md
run mode off
test ! -f .overrides/context/mode.md
test ! -f .overrides/context/obsidian.md
run update
run kill-my-self --dry-run --yes
test -f excalibur.yaml

echo "smoke: ok"
