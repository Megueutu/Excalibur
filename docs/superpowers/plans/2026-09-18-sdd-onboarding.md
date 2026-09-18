# SDD Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the prose-only, 2-question `bootstrap/` wizard with a manifest-driven onboarding flow (5 questions), split the Claude adapter into a dedicated `sdd-init` skill (onboarding) and the existing `sdd` skill (pipeline), and add a `translator` subagent for the one case where the flow needs to generate rather than copy content.

**Architecture:** `bootstrap/manifest.yaml` declares the questions and, for each option, an optional file to copy (source relative to the Excalibur root, destination relative to the project's SDD folder). `bootstrap/init.sh` gains an optional 4th argument: a copy-list file (`source<TAB>dest` per line) it copies after creating the base structure, on top of its existing two unconditional copies. `harnesses/claude/skills/sdd-init/SKILL.md` is a thin adapter (mirroring `harnesses/claude/skills/sdd/SKILL.md`'s existing style) that points to `bootstrap/entrypoint.md`, which documents the manifest-driven flow in harness-agnostic prose. Translation only runs when the resolved `language` answer isn't English, via `harnesses/claude/agents/translator.md`, invoked once per project.

**Tech Stack:** Markdown, bash (POSIX, Git Bash/WSL only — no PowerShell/cmd fallback), YAML (read by the agent as text, never parsed by a script).

**Spec:** [docs/superpowers/specs/2026-09-18-sdd-onboarding-design.md](../specs/2026-09-18-sdd-onboarding-design.md)

## Global Constraints

- Claude-only scope — no other harness adapter is touched or added in this plan.
- English is the only frozen source for copied content; no per-language file matrix is created.
- The agent never generates SDD content itself, except via the dedicated `translator` subagent, and only when the resolved `language` answer is not English.
- `bootstrap/init.sh` keeps its existing mode/target-path/project-name validation and exit codes 0/1/2 unchanged; only exit code 3 (copy-list file not found) is new.
- Scripts are bash only (Git Bash on Windows, native on Mac/Linux) — no PowerShell/cmd native support.
- Commits follow [`rules/git.md`](../../../rules/git.md): `{pattern}: {message}`, no scope, always English, always fully lowercase, one commit per logical change.
- `projects/solaria/.contexto/` is not touched in this plan.

---

### Task 1: `bootstrap/manifest.yaml`

**Files:**
- Create: `bootstrap/manifest.yaml`

**Interfaces:**
- Produces: the question list `sdd-init` (Task 5) reads and asks in order, and the copy-pair shape `init.sh` (Task 3) consumes: each option that has `copy` provides `copy.source` (path relative to the Excalibur root) and `copy.dest` (path relative to the project's SDD destination). The `language` question's `other` option has `translate: true` instead of `copy`, signaling `sdd-init` to invoke the `translator` subagent (Task 6) after the base copy step, rather than copying an extra file.

- [ ] **Step 1: Write `bootstrap/manifest.yaml`**

```yaml
version: 1

questions:
  - id: destination
    prompt: "Where should this project's SDD live?"
    options:
      - value: embedded
        label: "Embedded (.sdd/ at the repo root)"
      - value: separate
        label: "Separate repository (<repo>-sdd)"

  - id: github_preset
    prompt: "How should git/GitHub be handled on this project?"
    options:
      - value: conservative
        label: "Conservative — never merge alone, always PR"
        copy:
          source: onboarding/github/conservative.md
          dest: git.md
      - value: direct
        label: "Direct — push straight to the branch, PR only if asked"
        copy:
          source: onboarding/github/direct.md
          dest: git.md
      - value: custom
        label: "Specify in free text"

  - id: language
    prompt: "What language should this project's specs be written in?"
    options:
      - value: en
        label: "English (canonical source, no extra step)"
      - value: other
        label: "Another language (inferred from this conversation, or asked if unclear)"
        translate: true

  - id: review_depth
    prompt: "Default depth for the final review checklist?"
    options:
      - value: light
        label: "Light"
        copy:
          source: onboarding/review-depth/light.md
          dest: review-checklist-override.md
      - value: standard
        label: "Standard (no override)"
      - value: strict
        label: "Strict"
        copy:
          source: onboarding/review-depth/strict.md
          dest: review-checklist-override.md

  - id: commit_convention
    prompt: "Which commit/branch convention should this project adopt?"
    options:
      - value: conventional
        label: "Conventional Commits"
        copy:
          source: onboarding/commit-convention/conventional.md
          dest: commit-convention.md
      - value: free
        label: "Free-form"
        copy:
          source: onboarding/commit-convention/free.md
          dest: commit-convention.md
```

- [ ] **Step 2: Verify the file exists and every referenced `copy.source` path is planned for creation in Task 2**

```bash
test -f bootstrap/manifest.yaml && echo "manifest OK"
grep -oE 'source: onboarding/\S+' bootstrap/manifest.yaml
```

Expected: `manifest OK`, followed by 5 lines listing `onboarding/github/conservative.md`, `onboarding/github/direct.md`, `onboarding/review-depth/light.md`, `onboarding/review-depth/strict.md`, `onboarding/commit-convention/conventional.md`, `onboarding/commit-convention/free.md` (6 lines total — `standard` has no `copy`, so it won't appear).

- [ ] **Step 3: Commit**

```bash
git add bootstrap/manifest.yaml
git commit -m "feat: add onboarding manifest with five setup questions"
git push origin main
```

---

### Task 2: `bootstrap/onboarding/` source files

**Files:**
- Create: `bootstrap/onboarding/github/conservative.md` (moved from `bootstrap/presets/github/conservative.md`)
- Create: `bootstrap/onboarding/github/direct.md` (moved from `bootstrap/presets/github/direct.md`)
- Create: `bootstrap/onboarding/review-depth/light.md`
- Create: `bootstrap/onboarding/review-depth/strict.md`
- Create: `bootstrap/onboarding/commit-convention/conventional.md`
- Create: `bootstrap/onboarding/commit-convention/free.md`
- Delete: `bootstrap/presets/` (entire directory, once the two files above are moved)

**Interfaces:**
- Produces: the 6 files every `copy.source` in `bootstrap/manifest.yaml` (Task 1) points at.

- [ ] **Step 1: Move the GitHub presets**

```bash
mkdir -p bootstrap/onboarding/github bootstrap/onboarding/review-depth bootstrap/onboarding/commit-convention
git mv bootstrap/presets/github/conservative.md bootstrap/onboarding/github/conservative.md
git mv bootstrap/presets/github/direct.md bootstrap/onboarding/github/direct.md
rmdir bootstrap/presets/github bootstrap/presets
```

- [ ] **Step 2: Write `bootstrap/onboarding/review-depth/light.md`**

```markdown
# Review depth — light

Applies to this project's final checklist ([pipeline/review-checklist.md](../../../pipeline/review-checklist.md)) on top of the default:

- Skip the dedicated review subagent step for **Feature** tasks — inline review is enough, even for Feature (not just Fix).
- Still run `git diff` and the AI-trail check before announcing done.
```

- [ ] **Step 3: Write `bootstrap/onboarding/review-depth/strict.md`**

```markdown
# Review depth — strict

Applies to this project's final checklist ([pipeline/review-checklist.md](../../../pipeline/review-checklist.md)) on top of the default:

- Use the dedicated review subagent for **Fix** tasks too, not only Feature/Big feature.
- Re-run the AI-trail grep a second time after any fix made in response to the first pass, before announcing done.
```

- [ ] **Step 4: Write `bootstrap/onboarding/commit-convention/conventional.md`**

```markdown
# Commit convention — Conventional Commits

- Format: `<type>(<scope>): <description>`, type one of `feat|fix|docs|refactor|test|chore`.
- Scope is optional but recommended when the repo has clear module boundaries.
- Body wraps at 72 columns, explains why not what.
```

- [ ] **Step 5: Write `bootstrap/onboarding/commit-convention/free.md`**

```markdown
# Commit convention — free-form

No fixed pattern enforced. Keep messages short, in the imperative mood, one logical change per commit.
```

- [ ] **Step 6: Verify all 6 files exist and `bootstrap/presets/` is gone**

```bash
for f in bootstrap/onboarding/github/conservative.md bootstrap/onboarding/github/direct.md bootstrap/onboarding/review-depth/light.md bootstrap/onboarding/review-depth/strict.md bootstrap/onboarding/commit-convention/conventional.md bootstrap/onboarding/commit-convention/free.md; do
  test -f "$f" && echo "OK: $f" || echo "MISSING: $f"
done
test ! -d bootstrap/presets && echo "OK: bootstrap/presets removed"
```

Expected: 6 `OK:` lines, no `MISSING:` line, and `OK: bootstrap/presets removed`.

- [ ] **Step 7: Commit**

```bash
git add bootstrap/onboarding bootstrap/presets
git commit -m "feat: add onboarding source files for review depth and commit convention"
git push origin main
```

---

### Task 3: Generalize `bootstrap/init.sh` for a resolved copy list

**Files:**
- Modify: `bootstrap/init.sh`

**Interfaces:**
- Consumes: an optional 4th CLI argument, a copy-list file with `source<TAB>dest` lines (source relative to the Excalibur root, dest relative to `$DEST`) — this is what `sdd-init` (Task 5) will generate from the manifest answers and pass in.
- Produces: exit code `3` when a given copy-list file doesn't exist, on top of the existing `0`/`1`/`2`.

- [ ] **Step 1: Update the script header comment and argument parsing**

Replace:
```bash
#!/usr/bin/env bash
# bootstrap/init.sh — materializes the SDD destination for a project.
# Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name]
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

MODE="${1:-}"
TARGET_PATH="${2:-}"
PROJECT_NAME="${3:-}"

if [[ "$MODE" != "embedded" && "$MODE" != "separate" ]]; then
  echo "Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name]" >&2
  exit 1
fi
```

with:
```bash
#!/usr/bin/env bash
# bootstrap/init.sh — materializes the SDD destination for a project.
# Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]
#   copy-list-file: optional path to a file with "<source>\t<dest>" lines —
#     source relative to the Excalibur root, dest relative to the SDD
#     destination. Each pair is copied after the base structure is created.
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

MODE="${1:-}"
TARGET_PATH="${2:-}"

if [[ "$MODE" != "embedded" && "$MODE" != "separate" ]]; then
  echo "Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]" >&2
  exit 1
fi

if [[ "$MODE" == "separate" ]]; then
  PROJECT_NAME="${3:-}"
  COPY_LIST="${4:-}"
else
  PROJECT_NAME=""
  COPY_LIST="${3:-}"
fi
```

- [ ] **Step 2: Add the copy-list loop after the two existing unconditional copies**

Replace:
```bash
mkdir -p "$DEST/specs" "$DEST/Templates" "$DEST/reflection"
cp "$EXCALIBUR_ROOT/pipeline/spec-template.md" "$DEST/Templates/spec-template.md"
cp "$EXCALIBUR_ROOT/reflection/when-to-pause.md" "$DEST/reflection/when-to-pause.md"
touch "$DEST/specs/.gitkeep"

echo "Created SDD destination at: $DEST"
echo "Next: copy the chosen GitHub preset from bootstrap/presets/github/ to $DEST/git.md"
```

with:
```bash
mkdir -p "$DEST/specs" "$DEST/Templates" "$DEST/reflection"
cp "$EXCALIBUR_ROOT/pipeline/spec-template.md" "$DEST/Templates/spec-template.md"
cp "$EXCALIBUR_ROOT/reflection/when-to-pause.md" "$DEST/reflection/when-to-pause.md"
touch "$DEST/specs/.gitkeep"

if [[ -n "$COPY_LIST" ]]; then
  if [[ ! -f "$COPY_LIST" ]]; then
    echo "Error: copy-list file not found: $COPY_LIST" >&2
    exit 3
  fi
  while IFS=$'\t' read -r SRC DST || [[ -n "$SRC" ]]; do
    [[ -z "$SRC" ]] && continue
    mkdir -p "$(dirname "$DEST/$DST")"
    cp "$EXCALIBUR_ROOT/$SRC" "$DEST/$DST"
  done < "$COPY_LIST"
fi

echo "Created SDD destination at: $DEST"
```

- [ ] **Step 3: Verify syntax**

```bash
bash -n bootstrap/init.sh && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 4: Dry-run without a copy-list file (backward-compatible path)**

```bash
SCRATCH="$(mktemp -d)"
mkdir -p "$SCRATCH/fake-repo"
bootstrap/init.sh embedded "$SCRATCH/fake-repo"
test -f "$SCRATCH/fake-repo/.sdd/Templates/spec-template.md" && echo "base copy OK"
rm -rf "$SCRATCH"
```

Expected: `base copy OK`

- [ ] **Step 5: Dry-run with a copy-list file (embedded mode)**

```bash
SCRATCH="$(mktemp -d)"
mkdir -p "$SCRATCH/fake-repo"
printf 'onboarding/github/direct.md\tgit.md\nonboarding/commit-convention/free.md\tcommit-convention.md\n' > "$SCRATCH/copy-list.txt"
bootstrap/init.sh embedded "$SCRATCH/fake-repo" "" "$SCRATCH/copy-list.txt"
test -f "$SCRATCH/fake-repo/.sdd/git.md" && echo "copy-list git.md OK"
test -f "$SCRATCH/fake-repo/.sdd/commit-convention.md" && echo "copy-list commit-convention.md OK"
rm -rf "$SCRATCH"
```

Expected: `copy-list git.md OK` and `copy-list commit-convention.md OK`

- [ ] **Step 6: Verify the missing-copy-list-file error**

```bash
SCRATCH="$(mktemp -d)"
mkdir -p "$SCRATCH/fake-repo"
bootstrap/init.sh embedded "$SCRATCH/fake-repo" "" "$SCRATCH/does-not-exist.txt"; echo "exit code: $?"
rm -rf "$SCRATCH"
```

Expected: prints the `Error: copy-list file not found` message and `exit code: 3`

- [ ] **Step 7: Re-run the existing embedded/separate/error dry-runs to confirm no regression**

```bash
SCRATCH="$(mktemp -d)"
mkdir -p "$SCRATCH/fake-repo"
bootstrap/init.sh embedded "$SCRATCH/fake-repo"
test -d "$SCRATCH/fake-repo/.sdd/specs" && test -d "$SCRATCH/fake-repo/.sdd/Templates" && echo "embedded OK"
rm -rf "$SCRATCH"

SCRATCH="$(mktemp -d)"
bootstrap/init.sh separate "$SCRATCH" sample-project
test -d "$SCRATCH/sample-project-sdd/specs" && echo "separate OK"
rm -rf "$SCRATCH"

bootstrap/init.sh bad-mode /tmp/x; echo "exit code: $?"
bootstrap/init.sh separate /tmp/x; echo "exit code: $?"
```

Expected: `embedded OK`, `separate OK`, usage message + `exit code: 1`, missing-project-name error + `exit code: 1`

- [ ] **Step 8: Commit**

```bash
git add bootstrap/init.sh
git commit -m "feat: accept a resolved copy-list file in the bootstrap script"
git push origin main
```

---

### Task 4: Rewrite `bootstrap/entrypoint.md` as manifest-driven

**Files:**
- Modify: `bootstrap/entrypoint.md`

**Interfaces:**
- Consumes: `bootstrap/manifest.yaml` (Task 1), the new `bootstrap/init.sh` 4th argument (Task 3).
- Produces: the flow `harnesses/claude/skills/sdd-init/SKILL.md` (Task 5) points to — that file stays a thin pointer here, so this is the only place the flow's steps are spelled out.

- [ ] **Step 1: Replace the full file content**

```markdown
# Bootstrap — creating the SDD for a new project

Runs once per project, before any implementation task (`pipeline/entrypoint.md`) can start. Triggered by the harness adapter in use (see `harnesses/<harness>/`) when it doesn't find an SDD destination already configured for the project (see "Detection" below).

## 1. Check detection first

Before asking anything, confirm the project doesn't already have an SDD destination (see "Detection" below). If it does, stop — don't re-run onboarding on top of an existing destination.

## 2. Ask: adapt an existing project or start from scratch?

- **Adapt existing**: the project already has code, possibly already has some documentation/process — read what exists (`README.md`, `CONTRIBUTING.md`, etc.) before proposing the structure, instead of just overwriting it.
- **From scratch**: new project or one with no defined process yet — go straight to step 3.

## 3. Ask every question in `manifest.yaml`, in order

Read [`bootstrap/manifest.yaml`](manifest.yaml). For each entry in `questions`, ask its `prompt` using its `options`' `label`s verbatim — don't invent a question that isn't in the manifest, don't skip one that is. For the `language` question, try inferring the answer from the language the user is using in this conversation before asking explicitly.

## 4. Resolve answers into a copy-list file

For each answered question, look at the chosen option in the manifest:
- If it has a `copy` block, add one `source<TAB>dest` line (using `copy.source` and `copy.dest` verbatim) to a temporary copy-list file.
- If it has no `copy` block and no `translate` flag (e.g. `destination`, `review_depth: standard`, or `github_preset: custom`), it contributes no line — `destination` only decides the target path in step 5, and `custom` means the user's free text becomes `git.md` directly, without going through the copy list.
- If it has `translate: true` (the `language: other` option), don't add a copy-list line — remember to run step 6 after step 5.

## 5. Run the script

```bash
bootstrap/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]
```

This creates the destination structure (specs/, Templates/, reflection/) and copies every pair from the copy-list file on top of the two files it always copies (`pipeline/spec-template.md`, `reflection/when-to-pause.md`) — see the full contract in `init.sh`'s header. If `github_preset` was answered `custom`, write the user's free text to `git.md` in the destination yourself, after the script runs.

## 6. Translate, only if `language` was answered `other`

Invoke the `translator` subagent (see `harnesses/claude/agents/translator.md` for the Claude adapter) against the destination's `Templates/` and `reflection/` folders, with the language resolved in step 3. This runs exactly once, right after step 5 — never automatically again later.

## 7. After running it

Go straight to [`pipeline/entrypoint.md`](../pipeline/entrypoint.md) with the project's first real task — bootstrap only prepares the destination, it doesn't implement anything.

## Detection (for harness adapters)

Before triggering this wizard, check whether the project already has an SDD destination:
1. Does `.sdd/` exist at the root of the project's repo? → already bootstrapped, embedded mode.
2. Does `../<repo-name>-sdd/` exist (sibling folder of the repo)? → already bootstrapped, separate mode.
3. Neither → trigger this wizard.
```

- [ ] **Step 2: Verify internal links resolve**

```bash
realpath -m bootstrap/manifest.yaml
realpath -m bootstrap/../pipeline/entrypoint.md
test -f "$(realpath -m bootstrap/manifest.yaml)" && test -f "$(realpath -m bootstrap/../pipeline/entrypoint.md)" && echo "links OK"
```

Expected: `links OK`

- [ ] **Step 3: Commit**

```bash
git add bootstrap/entrypoint.md
git commit -m "docs: make bootstrap entrypoint manifest-driven"
git push origin main
```

---

### Task 5: Split the Claude adapter into `sdd-init` and `sdd`

**Files:**
- Create: `harnesses/claude/skills/sdd-init/SKILL.md`
- Modify: `harnesses/claude/skills/sdd/SKILL.md`

**Interfaces:**
- Consumes: `bootstrap/entrypoint.md` (Task 4).
- Produces: the `sdd-init` skill name/trigger that `sdd`'s adapter now points to instead of `bootstrap/entrypoint.md` directly.

- [ ] **Step 1: Write `harnesses/claude/skills/sdd-init/SKILL.md`**

```markdown
---
name: sdd-init
description: Use once, before any implementation task, when a project has no SDD destination configured yet (no `.sdd/` at its root and no sibling `<repo>-sdd/`). Runs the onboarding wizard that decides where the project's SDD lives, asks a fixed set of setup questions, and materializes the destination by copying pre-written files — never generating new content except a one-time translation step. Not for projects that already have an SDD destination — use the `sdd` skill for those.
---

# SDD Init (Claude adapter)

This file is the Claude adapter for Excalibur's onboarding wizard. It doesn't contain the methodology itself — just enough to trigger at the right time and point to the shared flow.

## When to trigger

Only when the user explicitly asks to set up/bootstrap SDD for a project, or when the `sdd` skill detects the project has no SDD destination yet and the user confirms they want to proceed with onboarding. Never run silently as a side effect of an unrelated task.

## What to do

1. Confirm the project has no SDD destination yet (see "Detection" in [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md#detection-for-harness-adapters)). If it already has one, stop and tell the user — don't re-run onboarding on top of an existing destination.
2. Follow [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md) exactly: read `bootstrap/manifest.yaml`, ask each question in order, resolve the answers into a copy list, call `bootstrap/init.sh`, and invoke the `translator` subagent if the resolved language isn't English.
3. Report what was created and hand off to the `sdd` skill for the project's first real task.

## References

- Methodology (shared, don't edit here): [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md), [`bootstrap/manifest.yaml`](../../../../bootstrap/manifest.yaml)
- Translation: [`harnesses/claude/agents/translator.md`](../../agents/translator.md)
- Next step after onboarding: [`harnesses/claude/skills/sdd/SKILL.md`](../sdd/SKILL.md)
```

- [ ] **Step 2: Update `harnesses/claude/skills/sdd/SKILL.md`'s "What to do" step 1**

Replace:
```markdown
1. Identify the project's repo being worked on. Check whether it already has an SDD destination (see "Detection" in [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md#detection-for-harness-adapters)):
   - No destination yet → follow [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md) first. Don't skip to implementation before that.
   - Already has a destination → go straight to step 2.
```

with:
```markdown
1. Identify the project's repo being worked on. Check whether it already has an SDD destination (see "Detection" in [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md#detection-for-harness-adapters)):
   - No destination yet → tell the user this project needs onboarding first, via the `sdd-init` skill. Don't skip to implementation before that.
   - Already has a destination → go straight to step 2.
```

- [ ] **Step 3: Verify links from the new skill resolve**

```bash
realpath -m harnesses/claude/skills/sdd-init/../../../../bootstrap/entrypoint.md
realpath -m harnesses/claude/skills/sdd-init/../../agents/translator.md
test -f "$(realpath -m harnesses/claude/skills/sdd-init/../../../../bootstrap/entrypoint.md)" && echo "entrypoint link OK"
```

Expected: `entrypoint link OK` (the `translator.md` path itself is only created in Task 6, so don't `test -f` it here)

- [ ] **Step 4: Commit**

```bash
git add harnesses/claude/skills/sdd-init harnesses/claude/skills/sdd/SKILL.md
git commit -m "feat: split claude adapter into sdd-init and sdd skills"
git push origin main
```

---

### Task 6: `translator` subagent

**Files:**
- Create: `harnesses/claude/agents/translator.md`

**Interfaces:**
- Consumes: a folder path and a target language, passed by `sdd-init` (Task 5) per `bootstrap/entrypoint.md` step 6 (Task 4).
- Produces: nothing consumed by a later task — this is the last piece the onboarding flow references.

- [ ] **Step 1: Write `harnesses/claude/agents/translator.md`**

```markdown
---
name: translator
description: Use only when invoked by the sdd-init skill to translate a freshly copied SDD folder (Templates/, reflection/) into a target language chosen during onboarding. Not for translating arbitrary text or for re-translating a project that was already onboarded.
tools: Read, Write, Glob
model: inherit
---

# Translator subagent

Translates every `.md` file inside the given folder from English into the given target language, in place, once. Never called outside the `sdd-init` onboarding flow.

## Input contract

Invoked with a folder path and a target language name. Both must be given explicitly by the caller — never guess the target language from file content.

## What to do

1. List every `.md` file under the given folder (recursively).
2. For each file:
   - Keep YAML frontmatter keys unchanged (e.g. `status`, `project`, `task`, `class`, `created`) — translate only frontmatter *values* that are free text, never key names.
   - Keep `[[wikilinks]]` targets unchanged — a wikilink points at a note by its (untranslated) file name.
   - Keep heading levels, callout types (`[!note]`, `[!warning]`, `[!danger]`), and list/checkbox structure unchanged — translate only their text content.
   - Translate all remaining prose into the target language.
   - Overwrite the file in place with the translated content.
3. Return the list of files written — nothing else. Don't summarize the translated content back to the caller.

## What NOT to do

- Don't touch any file outside the given folder.
- Don't re-run on a folder that was already translated in a previous onboarding — this subagent is invoked exactly once per project, by `sdd-init`.
- Don't add, remove, or reorder sections — structure is preserved, only language changes.
```

- [ ] **Step 2: Verify the file exists and the frontmatter parses as valid YAML**

```bash
test -f harnesses/claude/agents/translator.md && echo "file OK"
sed -n '2,5p' harnesses/claude/agents/translator.md
```

Expected: `file OK`, then the 4 frontmatter lines (`name:`, `description:`, `tools:`, `model:`) printed with no syntax errors visible (no unescaped colons breaking a line, no missing closing `---`).

- [ ] **Step 3: Commit**

```bash
git add harnesses/claude/agents/translator.md
git commit -m "feat: add translator subagent for non-english onboarding"
git push origin main
```

---

### Task 7: Update `rules/structure.md` and check for stale references

**Files:**
- Modify: `rules/structure.md`

**Interfaces:**
- Consumes: the final directory layout from Tasks 1–6.

- [ ] **Step 1: Update the tree diagram**

Replace:
```markdown
```
Excalibur/
  rules/            rules about Excalibur itself (this file and its neighbors)
  pipeline/          implementation methodology, harness-agnostic and project-agnostic
  reflection/         reasoning chain and rules for when to pause/ask
  bootstrap/          onboarding wizard: creates a new project's SDD destination
  harnesses/
    <harness>/         thin harness adapter — just "when to trigger" + pointer to the rest
  projects/
    solaria/.contexto/   Solaria's legacy context — do not use as a reference for a new project, see note below
```
```

with:
```markdown
```
Excalibur/
  rules/            rules about Excalibur itself (this file and its neighbors)
  pipeline/          implementation methodology, harness-agnostic and project-agnostic
  reflection/         reasoning chain and rules for when to pause/ask
  bootstrap/          onboarding wizard: manifest + question source files + init.sh
    manifest.yaml       declares the onboarding questions and their file copies
    onboarding/          source files copied verbatim per answer (github/, review-depth/, commit-convention/)
  harnesses/
    <harness>/         thin harness adapter — just "when to trigger" + pointer to the rest
      skills/            <harness>'s skill-invocation adapters (e.g. sdd-init, sdd, for Claude)
      agents/            <harness>'s subagent definitions (e.g. translator, for Claude)
  projects/
    solaria/.contexto/   Solaria's legacy context — do not use as a reference for a new project, see note below
```
```

- [ ] **Step 2: Check for any remaining reference to the removed `bootstrap/presets/` path**

```bash
grep -rn "bootstrap/presets" --include="*.md" . || echo "no bootstrap/presets references found"
```

Expected: `no bootstrap/presets references found`

- [ ] **Step 3: Full link-integrity pass over the whole repo, excluding `projects/`**

```bash
find . -not -path "./.git*" -not -path "./projects/*" -name "*.md" | while read -r f; do
  dir="$(dirname "$f")"
  grep -oE '\]\(([^)#]+)\)' "$f" | sed -E 's/^\]\(//; s/\)$//' | while read -r link; do
    case "$link" in http*|https*) continue ;; esac
    target="$(cd "$dir" 2>/dev/null && realpath -m "$link" 2>/dev/null)"
    [[ -n "$target" && -e "$target" ]] || echo "BROKEN: $f -> $link"
  done
done
echo "link check done"
```

Expected: any `BROKEN:` line printed must point only at links embedded inside markdown code-fence examples (illustrative, not real links from that file's location) — cross-check by opening the file at that line before treating it as real. No `BROKEN:` line should point at a real, non-code-fenced link. Fix any real breakage found before moving on.

- [ ] **Step 4: Commit**

```bash
git add rules/structure.md
git commit -m "docs: update repository structure for onboarding manifest layout"
git push origin main
```

---

## Final Verification

- [ ] Run Task 3 Steps 4–7 once more from the repo root — all dry-runs still pass.
- [ ] Run Task 7 Step 3's link-integrity pass one more time — no real broken links outside code-fence examples.
- [ ] Run `find bootstrap harnesses/claude -type f | sort` and confirm: `bootstrap/manifest.yaml` exists, `bootstrap/presets/` is gone, `bootstrap/onboarding/` has all 6 files from Task 2, `harnesses/claude/skills/sdd-init/SKILL.md` and `harnesses/claude/skills/sdd/SKILL.md` both exist, `harnesses/claude/agents/translator.md` exists.
- [ ] Run `git log --oneline -8` and confirm 6 commits from this plan are present, each following the `{pattern}: {message}` convention from `rules/git.md`.
