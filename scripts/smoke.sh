#!/usr/bin/env bash
# End-to-end smoke test: pack the package, install it in a throwaway project and
# run the commands that must always work. Exits non-zero on the first failure.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
# Keep per-user state (profile pointer, project registry) out of the real home directory.
export EXCALIBUR_HOME="$WORK/excalibur-home"

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
mkdir -p .sdd
run canvas
test -f .sdd/project.canvas
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
mkdir -p .sdd
run new api demo-task --class fix
test -f .sdd/specs/api/demo-task/spec.md
run lint

# User profile: create, link, sync, drift and git handling.
run profile status
run sync
test ! -f .overrides/context/user-profile.md
run profile init "$WORK/my-profile"
test -f "$WORK/my-profile/global/conversation.md"
test -d "$WORK/my-profile/.git"
run sync
test -f .overrides/context/user-profile.md
test -f .overrides/user-profile/global/commits.md
grep -q "source-hash" .overrides/context/user-profile.md
git check-ignore -q .overrides/context/user-profile.md
run budget
run doctor
test -f "$EXCALIBUR_HOME/projects.yaml"
echo "- extra line" >> "$WORK/my-profile/global/writing.md"
npx --no-install excalibur profile status --json | grep -q '"snapshot": "stale"'
run sync
npx --no-install excalibur profile status --json | grep -q '"snapshot": "fresh"'
mkdir -p "$WORK/my-profile/profiles/work"
printf -- '---\ndescription: work rules\nwhen: when reviewing\n---\n\n- be strict\n' > "$WORK/my-profile/profiles/work/review.md"
if npx --no-install excalibur profile use nope </dev/null; then echo "profile use accepted an unknown profile"; exit 1; fi
run profile use work
run sync
test -f .overrides/user-profile/profiles/work/review.md
run profile snapshot committed
run sync
if git check-ignore -q .overrides/context/user-profile.md; then echo "snapshot should not be ignored when committed"; exit 1; fi
run profile snapshot ignored
run sync
git check-ignore -q .overrides/context/user-profile.md
run update
run lint

run kill-my-self --dry-run --yes
test -f excalibur.yaml

echo "smoke: ok"
