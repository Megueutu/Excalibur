# Repository Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the Excalibur repository into the target structure agreed in the design spec — `lib/` as the single operational directory (agents as YAML, scripts, pipeline process, opt-in feature fragments), a two-package CLI split (`create-excalibur` scaffold-only, `excalibur` ongoing), a generated `CLAUDE.md` entrypoint in target projects, and cleaner `rules/`, `harnesses/claude/skills/`, and root-level doc placement — without changing any of the framework's already-decided behavior.

**Architecture:** Pure reorganization plus three small new mechanisms (YAML-sourced agents built into the `.md` Claude Code needs, opt-in feature fragments installed into an always-read `.excalibur/context/`, and `CLAUDE.md` generation). Work proceeds bottom-up: convert and move content first (Tasks 1–4), then update the CLI code that reads it (Task 5), then add the two new user-facing mechanisms that depend on the new layout (Task 6), then the remaining cosmetic regroupings (Tasks 7–8), then the package split (Task 9), then doc relocation (Task 10), then a full cross-reference sweep and smoke test (Task 11).

**Tech Stack:** Node.js (no new dependencies — `@clack/prompts` + `mri` + `picocolors` stays the closed set), POSIX `.sh` scripts, this repo's own hand-rolled YAML reader/writer (`cli/src/lib/yaml.js`, or `excalibur/src/lib/yaml.js` after Task 9).

**Spec:** `docs/superpowers/specs/2026-09-20-repo-reorganization-design.md`

## Global Constraints

- Every commit message: `{type}: {message}`, no scope, always English, always fully lowercase, per `docs/repo/git.md`. Commit straight to `main`, no PR, per this session's standing instruction.
- No new npm dependency, ever — reuse `cli/src/lib/yaml.js` (its block-scalar support already handles multi-line prose; confirmed while writing this plan, no extension needed).
- `.sh` files: validate with `bash -n <file>` before considering a step done.
- `.js` files: validate with `node --check <file>` before considering a step done.
- Until Task 5 lands, the CLI's own commands (`init`, `update`, `build`, etc.) will not run correctly against the mid-migration tree — Tasks 1–4 only move/convert content and are verified with static checks (`bash -n`, `node --check`, round-trip diff scripts, `grep` for stale references), not by running the CLI. Task 5 is what makes the CLI work against the new layout again.
- Every task that moves a file must `grep -rn` the repository for the old path afterward and fix every reference before moving to the next task — don't defer this to Task 11's sweep for paths introduced in an earlier task.

---

### Task 1: Convert `pipeline/agents/*.md` to `lib/agents/*.yaml`

**Files:**
- Create: `lib/agents/orchestrator.yaml`, `lib/agents/spec-writer.yaml`, `lib/agents/idealizador.yaml`, `lib/agents/grill-me.yaml`, `lib/agents/review.yaml`, `lib/agents/translator.yaml`, `lib/agents/docs-updater.yaml`, `lib/agents/scenthound.yaml`
- Create: `lib/agents/README.md` (moved/adapted from `pipeline/agents/README.md`)
- Delete: `pipeline/agents/*.md` (all 9 files, including `README.md`, after conversion is verified)
- Create (scratch, not committed): a one-off Node conversion script and a round-trip verification script, both deleted at the end of this task

**Interfaces:**
- Produces: the YAML agent schema that Task 2's build step consumes:
  ```yaml
  name: <string>
  description: <string, one line, identical to today's frontmatter description>
  tools: <string, comma-separated, identical to today's frontmatter tools>
  skills:            # OPTIONAL key — omit entirely when the agent has no skills
    - <skill-name>
  model: <string, e.g. "inherit">
  body: |
    <everything that was after the closing --- in the original .md, verbatim>
  ```

- [ ] **Step 1: Write the scratch conversion script**

Create `/tmp/convert-agents.mjs` (outside the repo — this is a one-off tool, not shipped code):

```javascript
import fs from 'node:fs'
import path from 'node:path'

const REPO = 'C:/Users/davisilva-ieg/Excalibur'
const SRC_DIR = path.join(REPO, 'pipeline', 'agents')
const DST_DIR = path.join(REPO, 'lib', 'agents')

fs.mkdirSync(DST_DIR, { recursive: true })

function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/)
  if (lines[0].trim() !== '---') throw new Error('missing opening ---')
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { end = i; break }
  }
  if (end === -1) throw new Error('missing closing ---')

  const fmLines = lines.slice(1, end)
  const fm = {}
  for (const line of fmLines) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (!m) continue
    const [, key, rawValue] = m
    if (key === 'skills') {
      const inner = rawValue.trim().replace(/^\[/, '').replace(/\]$/, '')
      fm.skills = inner.split(',').map((s) => s.trim()).filter(Boolean)
    } else {
      fm[key] = rawValue.trim()
    }
  }

  // Body: everything after the closing ---, minus exactly one leading blank line.
  let bodyLines = lines.slice(end + 1)
  if (bodyLines[0] === '') bodyLines = bodyLines.slice(1)
  while (bodyLines[bodyLines.length - 1] === '') bodyLines.pop()
  const body = bodyLines.join('\n') + '\n'

  return { fm, body }
}

function toYaml({ fm, body }) {
  const out = []
  out.push(`name: ${fm.name}`)
  out.push(`description: ${fm.description}`)
  out.push(`tools: ${fm.tools}`)
  if (fm.skills && fm.skills.length) {
    out.push('skills:')
    for (const s of fm.skills) out.push(`  - ${s}`)
  }
  out.push(`model: ${fm.model}`)
  out.push('body: |')
  for (const line of body.split('\n')) {
    out.push(line === '' ? '' : `  ${line}`)
  }
  // body.split('\n') on a string ending in \n produces one trailing '' entry —
  // drop it so the file doesn't end in a dangling blank body line.
  if (out[out.length - 1] === '') out.pop()
  return out.join('\n') + '\n'
}

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md')
for (const file of files) {
  const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8')
  const parsed = parseFrontmatter(raw)
  const yaml = toYaml(parsed)
  const name = file.replace(/\.md$/, '')
  fs.writeFileSync(path.join(DST_DIR, `${name}.yaml`), yaml, 'utf8')
  console.log(`wrote ${name}.yaml`)
}
```

- [ ] **Step 2: Run the conversion script**

Run: `node /tmp/convert-agents.mjs`
Expected: eight lines of `wrote <name>.yaml`, one per agent (`orchestrator`, `spec-writer`, `idealizador`, `grill-me`, `review`, `translator`, `docs-updater`, `scenthound`).

- [ ] **Step 3: Write and run the round-trip verification script**

Create `/tmp/verify-agents.mjs`:

```javascript
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'C:/Users/davisilva-ieg/Excalibur/cli/src/lib/yaml.js'

const REPO = 'C:/Users/davisilva-ieg/Excalibur'
const SRC_DIR = path.join(REPO, 'pipeline', 'agents')
const DST_DIR = path.join(REPO, 'lib', 'agents')

function rebuildMd(agent) {
  const lines = ['---', `name: ${agent.name}`, `description: ${agent.description}`, `tools: ${agent.tools}`]
  if (agent.skills && agent.skills.length) lines.push(`skills: [${agent.skills.join(', ')}]`)
  lines.push(`model: ${agent.model}`, '---', '')
  return lines.join('\n') + agent.body.replace(/\n+$/, '\n')
}

let failed = false
for (const file of fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
  const name = file.replace(/\.md$/, '')
  const original = fs.readFileSync(path.join(SRC_DIR, file), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '\n')
  const yamlText = fs.readFileSync(path.join(DST_DIR, `${name}.yaml`), 'utf8')
  const agent = parse(yamlText)
  const rebuilt = rebuildMd(agent).replace(/\n+$/, '\n')
  if (rebuilt !== original) {
    failed = true
    console.log(`MISMATCH: ${name}`)
    console.log('--- expected ---')
    console.log(JSON.stringify(original.slice(0, 400)))
    console.log('--- got ---')
    console.log(JSON.stringify(rebuilt.slice(0, 400)))
  } else {
    console.log(`OK: ${name}`)
  }
}
process.exit(failed ? 1 : 0)
```

Run: `node /tmp/verify-agents.mjs`
Expected: `OK: <name>` for all eight agents, exit code 0. If any `MISMATCH` prints, fix `toYaml`/`parseFrontmatter` in the conversion script (most likely cause: a body line containing a colon that the round-trip's frontmatter re-assembly misparses, or a trailing-whitespace difference) and re-run Steps 1–3 until clean.

- [ ] **Step 4: Move `pipeline/agents/README.md` to `lib/agents/README.md`, adapted**

Read `pipeline/agents/README.md`, and write `lib/agents/README.md` with the same content except:
- Replace any reference to "`.md` per agent" with "one `.yaml` source per agent, built into `.claude/agents/<name>.md` by `excalibur/src/lib/build.js`" (exact wording is yours to match the file's existing tone — this is documentation, not a schema).
- Keep every other structural claim (six/eight agents, tools allowlist reasoning, isolation-is-proposital explanation) unchanged.

- [ ] **Step 5: Delete the old `.md` agent files and the scratch scripts**

```bash
git rm pipeline/agents/orchestrator.md pipeline/agents/spec-writer.md pipeline/agents/idealizador.md pipeline/agents/grill-me.md pipeline/agents/review.md pipeline/agents/translator.md pipeline/agents/docs-updater.md pipeline/agents/scenthound.md pipeline/agents/README.md
rmdir pipeline/agents
rm /tmp/convert-agents.mjs /tmp/verify-agents.mjs
```

- [ ] **Step 6: Check for now-stale references to `pipeline/agents/`**

Run: `grep -rln "pipeline/agents" --include="*.md" --include="*.js" --include="*.sh" .`
For every hit outside `docs/superpowers/` and `.docs/` (historical planning documents are allowed to keep talking about what was true when they were written), update the reference to `lib/agents/`. Expected hits at minimum: `docs/repo/structure.md`, `README.md` if it mentions the path, any `SKILL.md` that links to an agent file directly.

- [ ] **Step 7: Add and commit**

```bash
git add lib/agents/ pipeline/agents/ docs/repo/structure.md README.md
git status
```

Confirm the status shows the 8 new `lib/agents/*.yaml` + `lib/agents/README.md` as added, and the 9 old `pipeline/agents/*.md` as deleted, plus whatever cross-reference files got touched in Step 6.

```bash
git commit -m "refactor: convert agent sources from md frontmatter to yaml"
```

---

### Task 2: Extend the build step to render `lib/agents/*.yaml` into `.claude/agents/*.md`

**Files:**
- Modify: `cli/src/lib/build.js`
- Modify: `cli/src/lib/paths.js` (nothing changes here yet — `shippedFolders` still says `pipeline`/`wizard`; Task 5 updates it. This task only changes how `build()` finds and renders agents, which Task 5's updated `shippedFolders` will make reachable.)

**Interfaces:**
- Consumes: `lib/agents/<name>.yaml`, parsed by `parse()` from `cli/src/lib/yaml.js` into `{ name, description, tools, skills?, model, body }`.
- Produces: `build(cwd, { harness })` returns `{ agents: string[], skills: string[] }` — same shape as today, unchanged for callers (`cli/src/commands/init.js`, `update.js`).

- [ ] **Step 1: Write `agentMarkdown()` and update `build()`**

In `cli/src/lib/build.js`, replace the current `buildGroup(cwd, 'pipeline/agents', targets.agents, ...)` call with a dedicated agent builder. Full new file contents:

```javascript
import path from 'node:path'
import fs from 'node:fs'
import { projectPaths, harnessTargets } from './paths.js'
import { resolveFile } from './resolve.js'
import { copyFile, ensureDir, listFiles, readText, writeText } from './fsx.js'
import { parse } from './yaml.js'

/**
 * Resolves .excalibur.custom/ over .excalibur/ and writes the effective files to
 * the fixed paths the harness actually reads.
 *
 * Why this exists: Claude Code reads one fixed path. It has no notion of "look in
 * the override folder first, then fall back". So something has to decide up front
 * which version of each file is the effective one and produce that file. That's
 * this step, and it's needed for everything following the base+override pattern —
 * agents, rules, templates — not only agents with a persona.
 *
 * Agents additionally need a FORMAT conversion, not just a copy: the source is
 * lib/agents/<name>.yaml (structured, so tools/skills/personas can be referenced
 * instead of retyped), but Claude Code's native subagent format is a single .md
 * with YAML frontmatter. This step does both — resolve, then render.
 *
 * Not a user-facing command: it runs automatically from init, update and customize,
 * which are the three moments the effective set can change. The CLI's command list
 * is a closed decision and doesn't include a build verb.
 */

/** Copies one logical group (a folder of the installed tree) to a harness path. */
function buildGroup(cwd, relDir, targetDir, filter = () => true) {
  const p = projectPaths(cwd)
  const written = []

  // The candidate list comes from base; anything custom-only is picked up too.
  const fromBase = listFiles(path.join(p.base, relDir))
  const fromCustom = listFiles(path.join(p.custom, relDir))
  const candidates = [...new Set([...fromBase, ...fromCustom])].filter(filter)

  for (const rel of candidates) {
    const source = resolveFile(cwd, path.join(relDir, rel).split(path.sep).join('/'))
    if (!source) continue
    const dest = path.join(cwd, targetDir, rel)
    copyFile(source, dest)
    written.push(path.join(targetDir, rel).split(path.sep).join('/'))
  }

  return written
}

/** Renders one agent's frontmatter, in the exact key order Claude Code's convention uses. */
function agentMarkdown(agent) {
  const lines = ['---', `name: ${agent.name}`, `description: ${agent.description}`, `tools: ${agent.tools}`]
  if (agent.skills && agent.skills.length) lines.push(`skills: [${agent.skills.join(', ')}]`)
  lines.push(`model: ${agent.model}`, '---', '')
  return lines.join('\n') + String(agent.body ?? '').replace(/\n+$/, '\n')
}

/** Resolves lib/agents/*.yaml (base+override) and writes the rendered .md the harness reads. */
function buildAgents(cwd, targetDir) {
  const p = projectPaths(cwd)
  const written = []

  const fromBase = listFiles(path.join(p.base, 'lib/agents')).filter((f) => f.endsWith('.yaml'))
  const fromCustom = listFiles(path.join(p.custom, 'lib/agents')).filter((f) => f.endsWith('.yaml'))
  const candidates = [...new Set([...fromBase, ...fromCustom])]

  for (const rel of candidates) {
    const source = resolveFile(cwd, `lib/agents/${rel}`)
    if (!source) continue
    const agent = parse(readText(source))
    const name = rel.replace(/\.yaml$/, '')
    const dest = path.join(cwd, targetDir, `${name}.md`)
    writeText(dest, agentMarkdown(agent))
    written.push(path.join(targetDir, `${name}.md`).split(path.sep).join('/'))
  }

  return written
}

export function build(cwd, { harness = 'claude' } = {}) {
  const targets = harnessTargets[harness]
  if (!targets) throw new Error(`Unknown harness: ${harness}`)

  ensureDir(path.join(cwd, targets.agents))
  ensureDir(path.join(cwd, targets.skills))

  const agents = buildAgents(cwd, targets.agents)

  // Skills keep their folder shape: a skill is <name>/SKILL.md plus whatever it
  // carries alongside, so the whole subtree is copied, not just the entry file.
  const skills = buildGroup(cwd, `harnesses/${harness}/skills`, targets.skills, (f) => f !== 'README.md')

  return { agents, skills }
}

/** True when the installed tree has anything to build from. */
export function canBuild(cwd) {
  const p = projectPaths(cwd)
  return fs.existsSync(path.join(p.base, 'lib', 'agents'))
}
```

- [ ] **Step 2: Validate syntax**

Run: `node --check cli/src/lib/build.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Write a standalone smoke test for `buildAgents`**

This can't run through `excalibur init` yet (Task 5 hasn't wired `shippedFolders` to `lib/` yet), so test the function directly against a fake `.excalibur/` tree.

Create `/tmp/test-build-agents.mjs`:

```javascript
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const REPO = 'C:/Users/davisilva-ieg/Excalibur'
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'excalibur-build-test-'))

fs.mkdirSync(path.join(tmp, '.excalibur', 'lib', 'agents'), { recursive: true })
fs.copyFileSync(
  path.join(REPO, 'lib', 'agents', 'translator.yaml'),
  path.join(tmp, '.excalibur', 'lib', 'agents', 'translator.yaml'),
)
fs.mkdirSync(path.join(tmp, '.excalibur.custom'), { recursive: true })
fs.mkdirSync(path.join(tmp, 'harnesses', 'claude', 'skills'), { recursive: true }) // build() also touches skills; harmless empty dir here

const { build } = await import(path.join(REPO, 'cli', 'src', 'lib', 'build.js').replace(/\\/g, '/'))
const result = build(tmp)

const rendered = fs.readFileSync(path.join(tmp, '.claude', 'agents', 'translator.md'), 'utf8')
console.log(rendered.slice(0, 200))
console.log('---')
console.log('agents built:', result.agents)

if (!rendered.startsWith('---\nname: translator\n')) {
  console.error('FAIL: frontmatter did not render as expected')
  process.exit(1)
}
if (!rendered.includes('# Translator subagent')) {
  console.error('FAIL: body missing')
  process.exit(1)
}
console.log('PASS')
```

Run: `node /tmp/test-build-agents.mjs`
Expected: prints the start of the rendered file, then `PASS`.

- [ ] **Step 4: Clean up and commit**

```bash
rm /tmp/test-build-agents.mjs
git add cli/src/lib/build.js
git commit -m "feat: render yaml agent sources into the md frontmatter claude code reads"
```

---

### Task 3: Move the remaining `pipeline/*.md` files into `lib/pipeline/`

**Files:**
- Move: `pipeline/entrypoint.md` → `lib/pipeline/entrypoint.md`
- Move: `pipeline/task-types.md` → `lib/pipeline/task-types.md`
- Move: `pipeline/spec-template.md` → `lib/pipeline/spec-template.md`
- Move: `pipeline/review-checklist.md` → `lib/pipeline/review-checklist.md`
- Move: `pipeline/handoff-template.md` → `lib/pipeline/handoff-template.md`
- Move: `pipeline/README.md` → `lib/pipeline/README.md`
- Delete (now empty): `pipeline/`

**Interfaces:**
- Produces: `lib/pipeline/` as the new home every other file's cross-references need to point at.

- [ ] **Step 1: Move the files**

```bash
mkdir -p lib/pipeline
git mv pipeline/entrypoint.md lib/pipeline/entrypoint.md
git mv pipeline/task-types.md lib/pipeline/task-types.md
git mv pipeline/spec-template.md lib/pipeline/spec-template.md
git mv pipeline/review-checklist.md lib/pipeline/review-checklist.md
git mv pipeline/handoff-template.md lib/pipeline/handoff-template.md
git mv pipeline/README.md lib/pipeline/README.md
rmdir pipeline
```

- [ ] **Step 2: Fix cross-references inside the moved files themselves**

Run: `grep -n "pipeline/" lib/pipeline/*.md`
Every relative reference like `pipeline/entrypoint.md` or `pipeline/agents/` inside these six files needs updating: `pipeline/entrypoint.md` → `lib/pipeline/entrypoint.md`, `pipeline/task-types.md` → `lib/pipeline/task-types.md`, `pipeline/spec-template.md` → `lib/pipeline/spec-template.md`, `pipeline/review-checklist.md` → `lib/pipeline/review-checklist.md`, `pipeline/handoff-template.md` → `lib/pipeline/handoff-template.md`, `pipeline/agents/` → `lib/agents/` (these are now `.yaml`, so also check whether the specific filename mentioned needs a `.md`→`.yaml` extension fix, e.g. a stray mention of `pipeline/agents/review.md` becomes `lib/agents/review.yaml`).

- [ ] **Step 3: Fix cross-references everywhere else in the repo**

Run: `grep -rln "pipeline/" --include="*.md" --include="*.js" --include="*.sh" --include="*.json" . | grep -v "^./docs/superpowers/" | grep -v "^./.docs/"`

For each file returned, open it and update every `pipeline/entrypoint.md`, `pipeline/task-types.md`, `pipeline/spec-template.md`, `pipeline/review-checklist.md`, `pipeline/handoff-template.md`, `pipeline/agents/` reference to its `lib/pipeline/` or `lib/agents/` equivalent (per Step 2's mapping). Expected files include (not exhaustive — trust the grep, not this list): `docs/repo/structure.md`, `harnesses/claude/skills/*/SKILL.md` (several reference `pipeline/entrypoint.md` or `pipeline/task-types.md`), `lib/agents/*.yaml` bodies (the ones converted in Task 1 — yes, their prose references these paths too), `rules/*.md`.

Run the same grep again after fixing: `grep -rln "pipeline/" --include="*.md" --include="*.js" --include="*.sh" --include="*.json" . | grep -v "^./docs/superpowers/" | grep -v "^./.docs/"`
Expected: empty output (or only `docs/repo/git.md`-style files that mention "pipeline" as a concept word, not a path — read each remaining hit to confirm it's not a stale path before accepting it).

- [ ] **Step 4: Commit**

```bash
git add -A lib/pipeline pipeline
git status
git commit -m "refactor: move pipeline process docs under lib/pipeline"
```

(A second commit follows for the cross-reference fixes if they weren't staged together — keep it to one commit if `git status` shows everything together; split only if the diff is large enough that reviewing it as two commits is genuinely clearer.)

---

### Task 4: Move `wizard/scripts/` to `lib/scripts/`

**Files:**
- Move: all 15 files under `wizard/scripts/` (`check-gh.sh`, `check-git-repo.sh`, `convert-history.sh`, `create-github-repo.sh`, `detect-ci.sh`, `detect-monorepo.sh`, `detect-os.sh`, `detect-stack.sh`, `init-git-repo.sh`, `install-gh-linux-apt.sh`, `install-gh-linux-dnf.sh`, `install-gh-macos.sh`, `install-gh-windows.sh`, `record-history.sh`, `scaffold-obsidian-vault.sh`, `scan-spec-freshness.sh`, `setup-new-repo.sh`, `validate-md-size.sh`, `README.md`) → `lib/scripts/`

**Interfaces:**
- Produces: `lib/scripts/` as the shared script location every caller (onboarding flow, agents, CLI commands) now points at.

- [ ] **Step 1: List what's actually there, then move it**

```bash
ls wizard/scripts/
mkdir -p lib/scripts
git mv wizard/scripts/*.sh lib/scripts/
git mv wizard/scripts/README.md lib/scripts/README.md
rmdir wizard/scripts
```

- [ ] **Step 2: Fix cross-references**

Run: `grep -rln "wizard/scripts" --include="*.md" --include="*.js" --include="*.sh" --include="*.json" . | grep -v "^./docs/superpowers/" | grep -v "^./.docs/"`

Update every hit from `wizard/scripts/<name>.sh` to `lib/scripts/<name>.sh`. Expected files include: `wizard/entrypoint.md` (references several scripts by relative path), `lib/agents/review.yaml` and `lib/agents/docs-updater.yaml` (their bodies call `wizard/scripts/record-history.sh` and reference `wizard/scripts/scan-spec-freshness.sh`), `cli/src/commands/*.js` if any command shells out to a wizard script directly (check `check.js` for a `bash` invocation), `harnesses/claude/skills/try-gh/SKILL.md` (references `check-gh.sh`), `harnesses/claude/skills/docs-update/SKILL.md`, `harnesses/claude/skills/scenthound-scan/SKILL.md` if it references any script path.

Run the same grep again. Expected: empty (outside the excluded planning dirs).

- [ ] **Step 3: Validate every moved script still parses**

```bash
for f in lib/scripts/*.sh; do bash -n "$f" && echo "OK $f" || echo "FAIL $f"; done
```
Expected: `OK` for all 17 `.sh` files (a plain `git mv` doesn't change file content, so this should already pass — it's here to catch an accidental content change during the reference-fixing pass in Step 2).

- [ ] **Step 4: Commit**

```bash
git add -A lib/scripts wizard
git commit -m "refactor: move wizard scripts to lib/scripts as shared content"
```

---

### Task 5: Update `paths.js`, `init.js`, `migrations.js` for the new `lib/` layout

**Files:**
- Modify: `cli/src/lib/paths.js`
- Modify: `cli/src/commands/init.js`
- Modify: `cli/src/lib/migrations.js` (add a migration map entry — see Step 4)
- Create: `lib/_migrations/0.1.x-to-0.2.x.yaml`

**Interfaces:**
- Consumes: `lib/agents/`, `lib/pipeline/`, `lib/scripts/`, `rules/`, `reflection/`, `harnesses/` at `packageRoot` (unchanged location for now — this task doesn't touch the package split, that's Task 9).
- Produces: `shippedFolders = ['lib', 'rules', 'reflection']` (drops `wizard` and `pipeline`, adds `lib`), consumed by `installFramework()` in `init.js` and by `canBuild()`/`buildAgents()` in `build.js` (already pointing at `lib/agents` from Task 2).

- [ ] **Step 1: Update `shippedFolders` in `paths.js`**

In `cli/src/lib/paths.js`, change:
```javascript
export const shippedFolders = ['wizard', 'pipeline', 'rules', 'reflection']
```
to:
```javascript
export const shippedFolders = ['lib', 'rules', 'reflection']
```

- [ ] **Step 2: Validate syntax**

Run: `node --check cli/src/lib/paths.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Write the migration map for existing installs**

The agent format change (`pipeline/agents/*.md` → `lib/agents/*.yaml`) is a deeper change than a path rename — the file extension and internal structure both changed, so per the migration mechanism's own design (`cli/src/lib/migrations.js`'s doc comment), this must NOT be auto-renamed; it has to surface as an orphan for a human to look at. The `pipeline/*.md` process files and `wizard/scripts/*.sh` moves ARE simple renames (same format, new path), so those go under `renames`.

Create `lib/_migrations/0.1.x-to-0.2.x.yaml`:

```yaml
version: 1
from: "0.1.x"
to: "0.2.x"
renames:
  - from: pipeline/entrypoint.md
    to: lib/pipeline/entrypoint.md
  - from: pipeline/task-types.md
    to: lib/pipeline/task-types.md
  - from: pipeline/spec-template.md
    to: lib/pipeline/spec-template.md
  - from: pipeline/review-checklist.md
    to: lib/pipeline/review-checklist.md
  - from: pipeline/handoff-template.md
    to: lib/pipeline/handoff-template.md
removed:
  - pipeline/agents/orchestrator.md
  - pipeline/agents/spec-writer.md
  - pipeline/agents/idealizador.md
  - pipeline/agents/grill-me.md
  - pipeline/agents/review.md
  - pipeline/agents/translator.md
  - pipeline/agents/docs-updater.md
  - pipeline/agents/scenthound.md
  - wizard/scripts/check-gh.sh
  - wizard/scripts/check-git-repo.sh
  - wizard/scripts/convert-history.sh
  - wizard/scripts/create-github-repo.sh
  - wizard/scripts/detect-ci.sh
  - wizard/scripts/detect-monorepo.sh
  - wizard/scripts/detect-os.sh
  - wizard/scripts/detect-stack.sh
  - wizard/scripts/init-git-repo.sh
  - wizard/scripts/install-gh-linux-apt.sh
  - wizard/scripts/install-gh-linux-dnf.sh
  - wizard/scripts/install-gh-macos.sh
  - wizard/scripts/install-gh-windows.sh
  - wizard/scripts/record-history.sh
  - wizard/scripts/scaffold-obsidian-vault.sh
  - wizard/scripts/scan-spec-freshness.sh
  - wizard/scripts/setup-new-repo.sh
  - wizard/scripts/validate-md-size.sh
```

Note: `wizard/scripts/*` are listed under `removed`, not `renames`, even though `lib/scripts/*.sh` is a straight rename with identical content — because a customization of a *script* is unlikely to exist yet (no project has been onboarded end-to-end per `PENDENCIAS.md` item 14) and treating every script as a rename would require listing 17 more `renames` entries for zero real-world benefit right now. If a real customized script surfaces in `excalibur status` as orphaned after this ships, add the specific rename entry then — this is a judgment call favoring the common case (no customizations exist yet) over completeness for a install base that doesn't exist.

- [ ] **Step 4: Wire `installFramework()` to ship the migration map**

`_migrations/` is currently created empty (just a README) in `init.js`'s `installFramework()`. Add a copy step so `lib/_migrations/*.yaml` actually reaches `.excalibur/_migrations/` in a target project.

In `cli/src/commands/init.js`, inside `installFramework(cwd)`, right after the `for (const folder of shippedFolders)` loop and before the `copyDir(path.join(packageRoot, 'harnesses'), ...)` line, the shipped `lib/_migrations/` folder is already covered — it's inside `lib/`, which is already in `shippedFolders` as of Step 1, so `copyDir(path.join(packageRoot, 'lib'), path.join(paths.base, 'lib'))` already copies `lib/_migrations/0.1.x-to-0.2.x.yaml` to `.excalibur/lib/_migrations/0.1.x-to-0.2.x.yaml`. But `migrations.js`'s `loadMigrations()` reads from `p.migrations`, which `paths.js` defines as `path.join(cwd, BASE_DIR, MIGRATIONS_DIR)` = `.excalibur/_migrations/` — a different path than `.excalibur/lib/_migrations/`. Two options: move the migration map source to a location outside `lib/` so it isn't shipped as part of the agent/rules/pipeline content, or point `migrations.js` at `.excalibur/lib/_migrations/`. Take the first: migration maps are about the *install* upgrading itself, not day-to-day agent content, so they don't belong in `lib/`.

Move the migration map: `git mv lib/_migrations lib/../_migrations` is awkward — just create it at the repo root directly instead of under `lib/`:

```bash
mkdir -p _migrations
git mv lib/_migrations/0.1.x-to-0.2.x.yaml _migrations/0.1.x-to-0.2.x.yaml
rmdir lib/_migrations
```

Then in `cli/src/commands/init.js`'s `installFramework()`, add one line after the `shippedFolders` loop:

```javascript
  for (const folder of shippedFolders) {
    copyDir(path.join(packageRoot, folder), path.join(paths.base, folder))
  }
  copyDir(path.join(packageRoot, '_migrations'), paths.migrations)
  copyDir(path.join(packageRoot, 'harnesses'), path.join(paths.base, 'harnesses'))
```

(`paths.migrations` is already `path.join(cwd, BASE_DIR, MIGRATIONS_DIR)` from `paths.js` — this now populates it with the real map instead of leaving it empty.)

- [ ] **Step 5: Validate syntax**

Run: `node --check cli/src/commands/init.js`
Expected: no output, exit code 0.

- [ ] **Step 6: Smoke test `installFramework` + `build` end to end**

Now that `shippedFolders` and the migration copy are updated, this is the first point where a real `excalibur init --yes` can be exercised against the new layout.

```bash
rm -rf /tmp/excalibur-smoke && mkdir -p /tmp/excalibur-smoke && cd /tmp/excalibur-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/cli/bin/excalibur.js" init --yes
```

Expected: exits 0, and:
```bash
test -f .excalibur/lib/agents/translator.yaml && echo "agent source: OK"
test -f .claude/agents/translator.md && echo "agent built: OK"
test -f .excalibur/_migrations/0.1.x-to-0.2.x.yaml && echo "migration map shipped: OK"
test -f .excalibur/lib/scripts/detect-stack.sh && echo "scripts shipped: OK"
test -f .excalibur/lib/pipeline/entrypoint.md && echo "pipeline docs shipped: OK"
```
Expected: all five lines print. Then:
```bash
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-smoke
```

- [ ] **Step 7: Commit**

```bash
git add cli/src/lib/paths.js cli/src/commands/init.js _migrations/
git commit -m "feat: point the installer and migration map at the lib layout"
```

---

### Task 6: Feature fragments (`lib/features/`) and `CLAUDE.md` generation

**Files:**
- Create: `lib/features/obsidian.md`
- Modify: `cli/src/lib/paths.js` (add `context` to `projectPaths()`, add `CONTEXT_DIR` constant)
- Modify: `cli/src/commands/init.js` (install the chosen feature fragments into `.excalibur/context/`, generate `CLAUDE.md`)
- Modify: `cli/src/commands/update.js` (regenerate `CLAUDE.md` and re-sync `.excalibur/context/`, same "always rewritable, never a place for user edits" rule as the rest of `.excalibur/`)
- Modify: `wizard/manifest.yaml` (confirm the existing `obsidian_vault` question's `vault` option is what gates installing `lib/features/obsidian.md` — no new question needed, reuse what's there)

**Interfaces:**
- Produces: `installFeatureFragments(cwd, answers)` in `init.js`, called from both `init` and `update`; `writeClaudeMd(cwd)` in `init.js`, same dual-call pattern.

- [ ] **Step 1: Write `lib/features/obsidian.md`**

```markdown
# Obsidian integration

This project's SDD destination is meant to be opened as an Obsidian vault.

- Every `.md` file under the SDD destination follows `rules/writing-md-obsidian.md`
  — frontmatter, `[[wikilinks]]` between notes, and callouts (`> [!note]`,
  `> [!warning]`, `> [!danger]`) for decisions and open risks.
- `project.canvas` at the root of the SDD destination is a JSON Canvas file (open
  format, plain JSON) — open it in Obsidian for a spatial view of the project.
  It's kept current by the `review` agent; regenerate it on demand with
  `excalibur canvas`.
- Don't rely on any Obsidian plugin being installed — everything here is plain
  Markdown and plain JSON, readable with or without the app.
```

- [ ] **Step 2: Add `context` to `paths.js`**

In `cli/src/lib/paths.js`, add a constant and a path:

```javascript
export const CONTEXT_DIR = 'context'
```

and inside `projectPaths(cwd)`'s returned object, add:

```javascript
    context: path.join(cwd, BASE_DIR, CONTEXT_DIR),
```

- [ ] **Step 3: Validate syntax**

Run: `node --check cli/src/lib/paths.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Write the feature-fragment installer and `CLAUDE.md` generator in `init.js`**

In `cli/src/commands/init.js`, import `CONTEXT_DIR` alongside the existing `paths.js` imports, then add two functions after `installFramework`:

```javascript
/**
 * Installs the standing-context fragment for each opt-in feature the manifest
 * answers turned on. Read in FULL, every session — unlike architecture/, which is
 * pulled selectively per handoff. One manifest answer per feature gates one
 * lib/features/<feature>.md fragment; Obsidian is the first, not the only one.
 */
function installFeatureFragments(cwd, answers) {
  const paths = projectPaths(cwd)
  ensureDir(paths.context)

  const features = []
  if (answers.obsidian_vault === 'vault') features.push('obsidian')

  for (const feature of features) {
    const source = path.join(packageRoot, 'lib', 'features', `${feature}.md`)
    if (!exists(source)) continue
    copyFile(source, path.join(paths.context, `${feature}.md`))
  }

  return features
}

/**
 * CLAUDE.md is part of the regenerable .excalibur/ machinery — rewritten by every
 * init/update, same as everything else there. It's the one file Claude Code reads
 * automatically at the start of every session, so it's what points a brand-new
 * session at the Excalibur flow without the user invoking a skill by hand first.
 */
function writeClaudeMd(cwd) {
  const claudeMdPath = path.join(cwd, 'CLAUDE.md')
  writeText(
    claudeMdPath,
    [
      '# CLAUDE.md',
      '',
      'This project uses Excalibur (SDD). Before doing anything else:',
      '',
      `1. Read every file in \`${BASE_DIR}/${CONTEXT_DIR}/\` in full, if that folder`,
      '   has any files — those are standing project context that applies to every',
      '   session (installed by `excalibur init` for the features this project',
      '   opted into, e.g. Obsidian integration).',
      `2. Follow \`${BASE_DIR}/lib/pipeline/entrypoint.md\` for how to handle any`,
      '   implementation request — it defines the four pipeline layers',
      '   (orchestrator → spec → implement → review) and which ones a given task',
      '   actually needs.',
      '',
      `This file is regenerated by \`excalibur update\` — don't hand-edit it. Project-`,
      'specific standing instructions belong in a `lib/features/` fragment (ask for',
      'one to be added) or in your SDD destination, not here.',
      '',
    ].join('\n'),
  )
}
```

- [ ] **Step 5: Wire both into `init()`**

In the `export async function init(args, cwd)` body of `cli/src/commands/init.js`, right after the existing `writeVscodeFiles(cwd)` call, add:

```javascript
  const installedFeatures = installFeatureFragments(cwd, answers)
  writeClaudeMd(cwd)
```

And extend the `p.note([...])` summary block that lists what was written, adding a line:

```javascript
      installedFeatures.length
        ? `${pc.green('✓')} ${BASE_DIR}/${CONTEXT_DIR}/     ${installedFeatures.join(', ')} standing context`
        : '',
      `${pc.green('✓')} CLAUDE.md              entrypoint the harness reads every session`,
```

(insert these two lines into the existing array passed to `p.note`, in the same `.filter(Boolean).join('\n')` pattern already there).

- [ ] **Step 6: Validate syntax**

Run: `node --check cli/src/commands/init.js`
Expected: no output, exit code 0.

- [ ] **Step 7: Wire the same regeneration into `update.js`**

Read `cli/src/commands/update.js` first to see its exact current structure, then add calls to the same two functions (`installFeatureFragments`, `writeClaudeMd`) — import them from `init.js` (export both functions from `init.js` instead of leaving them unexported, since `update.js` now needs them too) at the point `update.js` already rewrites `.excalibur/`, using the answers already on file (`readAnswers(cwd)` — check `config.js` for the exact existing accessor name and reuse it, don't invent a new one).

- [ ] **Step 8: Validate syntax**

Run: `node --check cli/src/commands/init.js` and `node --check cli/src/commands/update.js`
Expected: no output, exit code 0 for both.

- [ ] **Step 9: Smoke test**

```bash
rm -rf /tmp/excalibur-smoke2 && mkdir -p /tmp/excalibur-smoke2 && cd /tmp/excalibur-smoke2 && git init -q
node "C:/Users/davisilva-ieg/Excalibur/cli/bin/excalibur.js" init --yes
test -f CLAUDE.md && echo "CLAUDE.md: OK"
grep -q "entrypoint.md" CLAUDE.md && echo "CLAUDE.md points at pipeline entrypoint: OK"
```
Expected: both lines print (no `context/` files expected here since `--yes` takes every default, and confirm during this step what the `obsidian_vault` question's default value actually is in `wizard/manifest.yaml` — if the default is `vault`, expect `test -f .excalibur/context/obsidian.md && echo "obsidian fragment: OK"` to also print; if the default is `md_only`, that's correctly absent and the smoke test should NOT expect the file). Then:
```bash
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-smoke2
```

- [ ] **Step 10: Commit**

```bash
git add lib/features/ cli/src/lib/paths.js cli/src/commands/init.js cli/src/commands/update.js
git commit -m "feat: add opt-in feature fragments and generate claude.md"
```

---

### Task 7: Regroup `rules/` heuristic YAML files under `rules/heuristics/`

**Files:**
- Move: `rules/md-size-limits.yaml` → `rules/heuristics/md-size-limits.yaml`
- Move: `rules/tasks-ordering.yaml` → `rules/heuristics/tasks-ordering.yaml`
- Move: `rules/canvas-update-checklist.yaml` → `rules/heuristics/canvas-update-checklist.yaml`
- Create: `rules/heuristics/README.md`

**Interfaces:**
- Produces: `rules/heuristics/` as the new path every reference to these three files needs to use.

- [ ] **Step 1: Move the files**

```bash
mkdir -p rules/heuristics
git mv rules/md-size-limits.yaml rules/heuristics/md-size-limits.yaml
git mv rules/tasks-ordering.yaml rules/heuristics/tasks-ordering.yaml
git mv rules/canvas-update-checklist.yaml rules/heuristics/canvas-update-checklist.yaml
```

- [ ] **Step 2: Write `rules/heuristics/README.md`**

```markdown
# rules/heuristics/

Machine-checked tables, not prose rules. Each file is read by a script or an
agent that needs a fixed answer without reasoning it out — the point of a
heuristic file is that reading it costs less than re-deriving the same
judgment call every time.

| File | What it decides |
|---|---|
| [`md-size-limits.yaml`](md-size-limits.yaml) | Which `.md` file types have a size limit (allowlist, not a global default) |
| [`tasks-ordering.yaml`](tasks-ordering.yaml) | Whether a task's checklist gets hierarchical or flat numbering |
| [`canvas-update-checklist.yaml`](canvas-update-checklist.yaml) | What `review` checks before touching the project canvas |

Everything else in `rules/` — `global/`, `stacks/`, and the top-level `.md`
files — is prose a human or an agent reads and reasons about. These three
files are the exception: a script parses them and acts on the value
directly, so they live apart from the prose.
```

- [ ] **Step 3: Fix cross-references**

Run: `grep -rln "rules/md-size-limits.yaml\|rules/tasks-ordering.yaml\|rules/canvas-update-checklist.yaml" --include="*.md" --include="*.js" --include="*.sh" . | grep -v "^./docs/superpowers/" | grep -v "^./.docs/"`

Update every hit to the `rules/heuristics/` path. Expected: `lib/agents/orchestrator.yaml` (references `rules/tasks-ordering.yaml`), `lib/agents/review.yaml` (references `rules/canvas-update-checklist.yaml`), `lib/agents/spec-writer.yaml` (references `rules/md-size-limits.yaml`), `lib/scripts/validate-md-size.sh`, `cli/src/commands/lint.js` and `cli/src/commands/doctor.js` (both read `rules/md-size-limits.yaml` per round 2's implementation).

Run the grep again. Expected: empty.

- [ ] **Step 4: Update `rules/README.md`** to list the new `heuristics/` subfolder alongside `global/` and `stacks/`, matching whatever format the existing table there already uses (read the file first).

- [ ] **Step 5: Commit**

```bash
git add -A rules/
git commit -m "refactor: group mechanical yaml heuristics under rules/heuristics"
```

---

### Task 8: Regroup the 11 task-type skills under `harnesses/claude/skills/task-types/`

**Files:**
- Move: `harnesses/claude/skills/{feat,fix,refactor,perf,test,docs,style,build,ci,chore,revert}/` → `harnesses/claude/skills/task-types/{feat,fix,refactor,perf,test,docs,style,build,ci,chore,revert}/`

**Interfaces:**
- Produces: `harnesses/claude/skills/task-types/` as the new location; `buildGroup`'s existing recursive `listFiles()` in `build.js` already handles nested subfolders with no code change needed (it walks the whole `harnesses/${harness}/skills` tree and preserves relative paths) — verify this in Step 3 rather than assuming it.

- [ ] **Step 1: Move the 11 skill folders**

```bash
mkdir -p harnesses/claude/skills/task-types
for t in feat fix refactor perf test docs style build ci chore revert; do
  git mv "harnesses/claude/skills/$t" "harnesses/claude/skills/task-types/$t"
done
```

- [ ] **Step 2: Fix cross-references**

Run: `grep -rln "skills/feat\|skills/fix\|skills/refactor\|skills/perf\|skills/test\|skills/docs\b\|skills/style\|skills/build\|skills/ci\b\|skills/chore\|skills/revert" --include="*.md" .`

Read each hit and update paths that point at one of these 11 skills to include the new `task-types/` segment. Be careful: `skills/docs` also matches the unrelated `docs-update` skill folder name as a substring in some greps — read matches, don't blind-replace. Expected hits: `lib/pipeline/task-types.md` if it links to the skills by path, `harnesses/README.md` or `harnesses/claude/README.md` if either lists all skills.

- [ ] **Step 3: Verify `build.js` still finds them with no code change**

```bash
rm -rf /tmp/excalibur-smoke3 && mkdir -p /tmp/excalibur-smoke3 && cd /tmp/excalibur-smoke3 && git init -q
node "C:/Users/davisilva-ieg/Excalibur/cli/bin/excalibur.js" init --yes
test -f .claude/skills/task-types/feat/SKILL.md && echo "nested skill built: OK"
```
Expected: prints `nested skill built: OK`, confirming `buildGroup`'s recursive walk needs no change for the new nesting. Then:
```bash
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-smoke3
```

- [ ] **Step 4: Commit**

```bash
git add -A harnesses/
git commit -m "refactor: group the 11 task-type skills under skills/task-types"
```

---

### Task 9: Split `cli/` into `create-excalibur/` and `excalibur/`, move `wizard/` into `create-excalibur/onboarding/`

**Files:**
- Create: `excalibur/` — receives everything currently under `cli/` (`package.json`, `bin/excalibur.js`, `src/`) only. `lib/`, `rules/`, `reflection/`, `harnesses/`, `_migrations/` stay exactly where they are, at the repo root, siblings of `excalibur/` and `create-excalibur/` — per the approved design spec's target tree.
- Create: `create-excalibur/` — new package: `package.json`, `bin/create-excalibur.js`, `src/` (the interactive form + install logic, adapted from `cli/src/commands/init.js`), `onboarding/` (renamed from `wizard/`: `manifest.yaml`, `flow.md` — renamed from `entrypoint.md`, `init.sh`, `onboarding/` snippet folder)
- Delete: `cli/`, `wizard/` (after their contents are relocated)

**Interfaces:**
- Produces: `excalibur/src/lib/paths.js`'s `packageRoot` is UNCHANGED in its arithmetic (`path.resolve(here, '..', '..', '..')`) — `excalibur/src/lib` sits at the same depth below the repo root that `cli/src/lib` did, so three levels up still lands on the repo root, where `lib/`, `rules/`, `reflection/`, `harnesses/` remain.
- Consumes (in `create-excalibur/`): `excalibur`'s code via `file:../excalibur` (Step 8) — this only works because both packages stay siblings inside the same repo checkout, so `create-excalibur/node_modules/excalibur` resolves (via npm's local `file:` handling, a symlink in current npm versions) back to the real `excalibur/` folder, whose `packageRoot` then still finds the real `lib/`/`rules/`/`reflection/`/`harnesses/` three levels up. **This stops working the moment `excalibur` is consumed from outside this repo checkout** (a real registry publish, or any install where the sibling `lib/`/`rules/`/etc. folders aren't physically present) — that's `PENDENCIAS.md` item 5's existing "publish for real" TODO, deliberately not solved here (confirmed with the project owner: keep the approved tree now, revisit packaging when a real publish is actually planned).

This task is the largest single mechanical move in this plan. Do it in this exact order — each step depends on the previous one being on disk before the next command runs.

- [ ] **Step 1: Create `excalibur/` and move the CLI code in**

The current `package.json` lives at the repo root (not inside `cli/`) — it describes the single package `cli/bin/excalibur.js` is the `bin` entry for. That's what moves into `excalibur/` here; the repo root gets a different, much smaller `package.json` in Step 12.

```bash
mkdir -p excalibur
git mv package.json excalibur/package.json
git mv cli/bin excalibur/bin
git mv cli/src excalibur/src
rmdir cli
```

- [ ] **Step 2: Confirm `packageRoot` still resolves correctly, unchanged**

Open `excalibur/src/lib/paths.js` and confirm the line still reads:
```javascript
export const packageRoot = path.resolve(here, '..', '..', '..')
```
No edit needed — `excalibur/src/lib` is the same distance from the repo root that `cli/src/lib` was, so this constant's arithmetic is still correct after the move. (This step exists to make that explicit rather than silently assume it — a reviewer checking this task should see the confirmation, not wonder whether it was overlooked.) Update the comment above it, though, since it previously said nothing about this depth dependency:

```javascript
/**
 * Root of the excalibur package itself (the source of truth for content).
 *
 * Three levels up from here (excalibur/src/lib) is the repo root, where lib/,
 * rules/, reflection/ and harnesses/ live as siblings of excalibur/ and
 * create-excalibur/ — not inside excalibur/ itself. This only resolves correctly
 * when excalibur/ is used from within this repo checkout (directly, or as a
 * file: dependency of create-excalibur/, which npm resolves as a symlink back
 * into this same checkout). A real npm registry publish would break this — see
 * PENDENCIAS.md item 5, deliberately not solved here.
 */
export const packageRoot = path.resolve(here, '..', '..', '..')
```

- [ ] **Step 3: Validate syntax on everything moved**

```bash
node --check excalibur/bin/excalibur.js
find excalibur/src -name "*.js" -exec node --check {} \;
```
Expected: no errors — moving files doesn't change their content, so this mainly catches a typo introduced in Step 2's comment edit.

- [ ] **Step 4: Update `excalibur/package.json`**

Read the current `package.json` (now at `excalibur/package.json`) and update its `bin` path (now relative to `excalibur/`, not the repo root) and its `files` array. Note `files` only lists what's physically inside `excalibur/` — `lib/`, `rules/`, `reflection/`, `harnesses/` are deliberately NOT listed here, because they're outside this package's own folder (see the `packageRoot` comment from Step 2); if a real registry publish is ever attempted, that's exactly the gap that needs solving first, not something to paper over by listing paths here that `npm pack` would silently ignore anyway.

```json
{
  "name": "excalibur",
  "version": "0.2.0",
  "description": "A ready-to-use SDD (Spec-Driven Development) framework for AI agents",
  "license": "MIT",
  "type": "module",
  "bin": {
    "excalibur": "bin/excalibur.js"
  },
  "engines": {
    "node": ">=18"
  },
  "files": [
    "bin/",
    "src/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "check": "node bin/excalibur.js check"
  },
  "dependencies": {
    "@clack/prompts": "^0.7.0",
    "mri": "^1.2.0",
    "picocolors": "^1.0.0"
  },
  "keywords": [
    "sdd",
    "spec-driven-development",
    "claude",
    "claude-code",
    "agents"
  ]
}
```

(version bumped to `0.2.0` — this reorganization is exactly the kind of breaking `.excalibur/` structure change `_migrations/0.1.x-to-0.2.x.yaml` from Task 5 exists for. `Excalibur.example` dropped from `files` since it lived at the old repo-root `cli/`-sibling location — confirm during this step whether that example file still exists and, if so, where it now makes sense to live; it's SDD-example content, not package code, so `docs/repo/` is a reasonable new home — use your judgment, this is a minor placement call, not a blocking one.)

- [ ] **Step 5: Smoke test `excalibur` standalone, from its new location**

```bash
rm -rf /tmp/excalibur-smoke4 && mkdir -p /tmp/excalibur-smoke4 && cd /tmp/excalibur-smoke4 && git init -q
node "C:/Users/davisilva-ieg/Excalibur/excalibur/bin/excalibur.js" init --yes
test -f CLAUDE.md && echo "OK: still works from excalibur/"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-smoke4
```
Expected: `OK: still works from excalibur/` prints. If it fails, the most likely cause is a leftover hardcoded `cli/`-relative path somewhere in `excalibur/src/` — `grep -rn "cli/" excalibur/src/` to find it.

- [ ] **Step 6: Create `create-excalibur/`, move `wizard/` into it as `onboarding/`, rename its flow doc**

```bash
mkdir -p create-excalibur
git mv wizard create-excalibur/onboarding
git mv create-excalibur/onboarding/entrypoint.md create-excalibur/onboarding/flow.md
```

- [ ] **Step 7: Fix the internal rename reference**

`create-excalibur/onboarding/flow.md` almost certainly refers to itself by its old name (`entrypoint.md`) somewhere, and other files reference `wizard/entrypoint.md` by path. Run:

```bash
grep -rln "wizard/entrypoint.md\|wizard/manifest.yaml\|wizard/init.sh\|wizard/onboarding" --include="*.md" --include="*.js" --include="*.sh" . | grep -v "^./docs/superpowers/" | grep -v "^./.docs/"
```

Update every hit: `wizard/entrypoint.md` → `create-excalibur/onboarding/flow.md`, `wizard/manifest.yaml` → `create-excalibur/onboarding/manifest.yaml`, `wizard/init.sh` → `create-excalibur/onboarding/init.sh`, `wizard/onboarding/` → `create-excalibur/onboarding/onboarding/` (the nested snippet folder keeps its own name — only the outer `wizard/` segment changes).

- [ ] **Step 8: Write `create-excalibur/package.json`**

```json
{
  "name": "create-excalibur",
  "version": "0.2.0",
  "description": "Scaffold a new Excalibur SDD project — the npm create excalibur entry point",
  "license": "MIT",
  "type": "module",
  "bin": {
    "create-excalibur": "bin/create-excalibur.js"
  },
  "engines": {
    "node": ">=18"
  },
  "files": [
    "bin/",
    "src/",
    "onboarding/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {},
  "dependencies": {
    "@clack/prompts": "^0.7.0",
    "mri": "^1.2.0",
    "picocolors": "^1.0.0",
    "excalibur": "file:../excalibur"
  },
  "keywords": [
    "sdd",
    "spec-driven-development",
    "claude",
    "claude-code",
    "create-excalibur"
  ]
}
```

(`"excalibur": "file:../excalibur"` is the monorepo-local dependency, standard for two packages developed side by side before either is published — this is what Step 11's `npm install` resolves against local disk. Once `excalibur` is published for real, this becomes a normal version range like `"^0.2.0"`; that publish step is future work, not part of this task.)

- [ ] **Step 9: Write `create-excalibur/bin/create-excalibur.js`**

This is the new scaffold-only entry point. Read `cli/bin/excalibur.js`'s original content (now `excalibur/bin/excalibur.js`) to see its command-dispatch shape first, then write a minimal, single-purpose script — it does NOT dispatch subcommands like `excalibur.js` does, it only runs the form:

```javascript
#!/usr/bin/env node
import mri from 'mri'
import pc from 'picocolors'
import { init } from 'excalibur/src/commands/init.js'

const args = mri(process.argv.slice(2), { boolean: ['yes', 'help'], alias: { h: 'help', y: 'yes' } })

if (args.help) {
  console.log(
    [
      `${pc.bold('create-excalibur')} — scaffold a new Excalibur SDD project`,
      '',
      `${pc.bold('Usage')}`,
      '  npm create excalibur',
      '  npm create excalibur -- --yes',
      '',
      `${pc.bold('Options')}`,
      '  --yes      Accept every manifest default, no prompts',
      '  -h, --help This text',
    ].join('\n'),
  )
  process.exit(0)
}

const cwd = process.cwd()
const code = await init(args, cwd)
process.exit(code)
```

(`init` is reused as-is from the `excalibur` package's own `src/commands/init.js` — `create-excalibur` doesn't reimplement scaffolding, it's a thinner entry point around the same logic `npx excalibur init` would run, which is also why `excalibur` ends up as a real dependency: `create-excalibur run` calling `init` is only possible because `excalibur`'s code is resolvable from `create-excalibur`'s own `node_modules`.)

- [ ] **Step 10: Validate syntax**

```bash
node --check create-excalibur/bin/create-excalibur.js
```
Expected: no output, exit code 0.

- [ ] **Step 11: Install and smoke test the two-package split for real**

```bash
cd "C:/Users/davisilva-ieg/Excalibur/excalibur" && npm install
cd "C:/Users/davisilva-ieg/Excalibur/create-excalibur" && npm install
rm -rf /tmp/create-excalibur-smoke && mkdir -p /tmp/create-excalibur-smoke && cd /tmp/create-excalibur-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/create-excalibur/bin/create-excalibur.js" --yes
test -f CLAUDE.md && echo "OK: create-excalibur scaffolds a working project"
test -f .claude/agents/translator.md && echo "OK: agents built through the dependency"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/create-excalibur-smoke
```
Expected: both `OK` lines print. If `npm install` inside `create-excalibur/` fails to resolve `excalibur` via `file:../excalibur`, confirm `excalibur/package.json`'s `name` field is exactly `excalibur` (Step 4) and that this step's first `npm install` (inside `excalibur/`) completed without error before the second one runs.

- [ ] **Step 12: Update the repo root's own `package.json`**

The root `package.json` no longer describes a single publishable package — it becomes a thin workspace-style marker (no new tooling like actual npm workspaces is being adopted here, per YAGNI — this is just enough to stop `npm publish` from accidentally running at the root with stale content):

```json
{
  "name": "excalibur-monorepo",
  "version": "0.0.0",
  "private": true,
  "description": "Development root for the excalibur and create-excalibur packages — not published itself",
  "license": "MIT"
}
```

- [ ] **Step 13: Commit**

```bash
git add -A excalibur/ create-excalibur/ cli/ wizard/ package.json package-lock.json
git status
```

Confirm `cli/` and `wizard/` show as deleted (moved), `excalibur/` and `create-excalibur/` as added. If `package-lock.json` at the repo root is now stale/irrelevant (it described the old single-package `dependencies`), remove it: `git rm package-lock.json` — each package now has (or will have, after its own `npm install`) its own lockfile.

```bash
git commit -m "refactor: split the cli into create-excalibur and excalibur packages"
```

---

### Task 10: Move process-tracking docs under `.docs/`

**Files:**
- Move: `docs/superpowers/` (entire tree: `specs/`, `plans/`) → `.docs/superpowers/`
- Move: `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_PLAN_2.md`, `IMPLEMENTATION_NOTES.md`, `IMPLEMENTATION_NOTES_2.md`, `PENDENCIAS.md` → `.docs/`
- Keep: `docs/repo/` stays exactly where it is

Do this task LAST among the content moves (as the design spec's roadmap says) so every task above writes its own tracking references against `docs/superpowers/specs/`/`plans/` while those paths are still live, and this one final move sweeps everything at once instead of chasing a moving target through nine other tasks.

**Interfaces:**
- Produces: `.docs/` as the new hidden location; nothing in `excalibur/` or `create-excalibur/` package content references `.docs/` or `docs/superpowers/` — these are pure repo-maintenance files, never shipped, so this move has no runtime interface to preserve.

- [ ] **Step 1: Move the files**

```bash
mkdir -p .docs
git mv docs/superpowers .docs/superpowers
git mv IMPLEMENTATION_PLAN.md .docs/IMPLEMENTATION_PLAN.md
git mv IMPLEMENTATION_PLAN_2.md .docs/IMPLEMENTATION_PLAN_2.md
git mv IMPLEMENTATION_NOTES.md .docs/IMPLEMENTATION_NOTES.md
git mv IMPLEMENTATION_NOTES_2.md .docs/IMPLEMENTATION_NOTES_2.md
git mv PENDENCIAS.md .docs/PENDENCIAS.md
```

- [ ] **Step 2: Confirm `docs/` now only has `repo/`**

```bash
ls docs/
```
Expected: only `repo/` listed.

- [ ] **Step 3: Fix cross-references**

```bash
grep -rln "docs/superpowers\|IMPLEMENTATION_PLAN\|IMPLEMENTATION_NOTES\|PENDENCIAS.md" --include="*.md" .
```
Update every hit — most will be inside `.docs/` itself (this plan and the spec cross-reference each other and the round 1/2 notes by their old `docs/superpowers/...` or root-level path) to the new `.docs/...` path. Also check `README.md` and `docs/repo/structure.md` for any mention of where implementation notes or brainstorm specs live.

- [ ] **Step 4: Update `docs/repo/structure.md`**

Read the file, then rewrite its directory tree and layer table to match the full target structure from the design spec (`excalibur/`, `create-excalibur/`, `.docs/`, the new `rules/heuristics/`, `harnesses/claude/skills/task-types/`) — this file is the canonical "what lives where" reference for anyone reading the repo, so it needs to be fully current, not just have its old paths find-and-replaced.

- [ ] **Step 5: Commit**

```bash
git add -A .docs/ docs/ README.md
git commit -m "docs: move ai-assisted development process tracking under .docs"
```

---

### Task 11: Final cross-reference sweep and full smoke test

**Files:**
- Modify: whatever `grep` in Step 1 turns up (cannot be listed exhaustively in advance — that's the point of this task)

**Interfaces:**
- Produces: a repository where no file references a path that no longer exists.

- [ ] **Step 1: Sweep for every path this plan moved**

```bash
grep -rln "pipeline/agents\|pipeline/entrypoint\|pipeline/task-types\|pipeline/spec-template\|pipeline/review-checklist\|pipeline/handoff-template\|wizard/scripts\|wizard/entrypoint\|wizard/manifest\|wizard/init.sh\|rules/md-size-limits.yaml\|rules/tasks-ordering.yaml\|rules/canvas-update-checklist.yaml\|cli/src\|cli/bin" --include="*.md" --include="*.js" --include="*.sh" --include="*.json" . | grep -v "^./.docs/"
```
Expected: empty output. Fix any remaining hit the same way earlier tasks did (map old path → new path per the moves already made).

- [ ] **Step 2: Confirm no file still lives at a deleted top-level path**

```bash
test -d pipeline && echo "STALE: pipeline/ still exists" || echo "OK: pipeline/ gone"
test -d wizard && echo "STALE: wizard/ still exists" || echo "OK: wizard/ gone"
test -d cli && echo "STALE: cli/ still exists" || echo "OK: cli/ gone"
test -d lib/_migrations && echo "STALE: lib/_migrations still exists" || echo "OK: lib/_migrations gone (moved to repo-root _migrations/ in task 5)"
```
Expected: all four print `OK:`.

- [ ] **Step 3: Complete the migration map with the renames Tasks 7 and 8 introduced**

`_migrations/0.1.x-to-0.2.x.yaml` (written in Task 5) only covers the `pipeline/*` and `wizard/scripts/*` moves, because Task 5 runs before Task 7 (rules heuristics regroup) and Task 8 (task-type skills regroup) — at the time it was written, those renames didn't exist yet. This is a known, deliberately deferred gap (see this plan's pre-flight ruling in the ledger) — complete it now that every rename in this reorganization is known.

Read the current `_migrations/0.1.x-to-0.2.x.yaml` and add these six entries to its existing `renames` list (don't replace the file, extend it):

```yaml
  - from: rules/md-size-limits.yaml
    to: rules/heuristics/md-size-limits.yaml
  - from: rules/tasks-ordering.yaml
    to: rules/heuristics/tasks-ordering.yaml
  - from: rules/canvas-update-checklist.yaml
    to: rules/heuristics/canvas-update-checklist.yaml
  - from: harnesses/claude/skills/feat
    to: harnesses/claude/skills/task-types/feat
  - from: harnesses/claude/skills/fix
    to: harnesses/claude/skills/task-types/fix
  - from: harnesses/claude/skills/refactor
    to: harnesses/claude/skills/task-types/refactor
```

Note only 3 of the 11 task-type skills are listed as an example set here — extend this to all 11 (`feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`), each following the identical `harnesses/claude/skills/<type> → harnesses/claude/skills/task-types/<type>` pattern. The migration mechanism (`applyMigrations` in `cli/src/lib/migrations.js`) renames whole paths, including directories, so one entry per skill folder is correct — it doesn't need a separate entry for each file inside a renamed skill folder.

- [ ] **Step 4: Full end-to-end smoke test against the finished layout**

```bash
rm -rf /tmp/excalibur-final-smoke && mkdir -p /tmp/excalibur-final-smoke && cd /tmp/excalibur-final-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/create-excalibur/bin/create-excalibur.js" --yes

test -f CLAUDE.md && echo "1 CLAUDE.md: OK"
test -f Excalibur && echo "2 config: OK"
for a in orchestrator spec-writer idealizador grill-me review translator docs-updater scenthound; do
  test -f ".claude/agents/$a.md" && echo "3 agent $a built: OK" || echo "3 agent $a MISSING"
done
test -f .claude/skills/task-types/feat/SKILL.md && echo "4 task-type skill nested: OK"
test -f .claude/skills/guardrail/SKILL.md && echo "5 flat skill: OK"
test -f .excalibur/rules/heuristics/md-size-limits.yaml && echo "6 heuristics grouped: OK"
test -f .excalibur/_migrations/0.1.x-to-0.2.x.yaml && echo "7 migration map shipped: OK"

node "C:/Users/davisilva-ieg/Excalibur/excalibur/bin/excalibur.js" status
node "C:/Users/davisilva-ieg/Excalibur/excalibur/bin/excalibur.js" doctor
node "C:/Users/davisilva-ieg/Excalibur/excalibur/bin/excalibur.js" lint

cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-final-smoke
```
Expected: every numbered `OK`/`built: OK` line prints (8 agent checks total, all `OK`), and `status`/`doctor`/`lint` each exit without a crash (their actual findings don't matter here — a clean scaffold should report a healthy project, but the smoke test is checking the commands run at all against the new layout, not auditing their output line by line).

- [ ] **Step 5: Run every `.sh` and `.js` syntax check one more time, repo-wide**

```bash
find . -name "node_modules" -prune -o -name "*.sh" -print | while read -r f; do bash -n "$f" || echo "FAIL $f"; done
find . -name "node_modules" -prune -o -name "*.js" -print | while read -r f; do node --check "$f" >/dev/null 2>&1 || echo "FAIL $f"; done
```
Expected: no `FAIL` lines.

- [ ] **Step 6: Commit**

```bash
git add -A
git status
git commit -m "fix: sweep remaining stale path references after the reorganization"
```

(If Steps 1–5 found nothing to fix, there's nothing to commit here — that's a valid outcome, skip the commit and say so rather than creating an empty one.)

- [ ] **Step 7: Push**

```bash
git push origin main
```
