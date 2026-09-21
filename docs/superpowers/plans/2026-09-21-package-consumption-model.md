# Package Consumption Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the copy-into-`.excalibur/` installation model with real `node_modules`-based consumption (no copy — the CLI resolves content from wherever npm actually put the package), add public/discreet install modes, a configurable overrides folder name, and an automatic `postinstall` rebuild.

**Architecture:** `create-excalibur/` and `excalibur/` merge back into one package at the repo root (two `bin` entries). `src/lib/paths.js`'s `packageRoot` — which already just resolves to wherever the currently-running code lives — becomes the single source for framework content; there is no more copy step. Every project-side path (`custom_dir`, `context_dir`, the config's own location) becomes config-driven: `excalibur.yaml` (public mode) or a `package.json` `"excalibur"` key (discreet mode), one document holding what used to be three files (config, answers, session).

**Tech Stack:** Node.js (`@clack/prompts`, `mri`, `picocolors` — no new dependency), the repo's own minimal YAML reader/writer (`src/lib/yaml.js`).

**Spec:** `docs/superpowers/specs/2026-09-21-package-consumption-model-design.md`

## Global Constraints

- No new npm dependency, ever.
- `.js` files: validate with `node --check <file>` before considering a step done.
- Every commit message: `{type}: {message}`, no scope, always English, always fully lowercase, per `docs/repo/git.md`.
- Every task that moves a file must grep the repository for the old path afterward and fix every reference before moving to the next task.
- Work directly on `main`, no worktree, no branch — direct commits to `main` are explicitly authorized for this session; push after each task.
- `base` (framework content location) is ALWAYS `packageRoot` (wherever the running code lives) — never written to by any command. Only `custom_dir`, the config file/key, `CLAUDE.md`, and `.claude/agents/`+`.claude/skills/` are ever written into a target project.

---

### Task 1: Merge `create-excalibur/` and `excalibur/` into the repo root

**Files:**
- Move: `excalibur/bin/excalibur.js` → `bin/excalibur.js`
- Move: `excalibur/src/` → `src/`
- Move: `create-excalibur/bin/create-excalibur.js` → `bin/create-excalibur.js`
- Move: `create-excalibur/onboarding/` → `onboarding/`
- Modify: root `package.json` (replace the `excalibur-monorepo` marker with the real merged package descriptor)
- Delete: `excalibur/`, `create-excalibur/` (now empty)

**Interfaces:**
- Produces: `packageRoot` in `src/lib/paths.js` (Task 2 rewrites its value, but the file itself lives at `src/lib/paths.js` after this task) resolves two levels up from `src/lib/` — the repo root, which is now also the package root.
- Produces: `bin/create-excalibur.js` imports `init` via a plain relative path (`../src/commands/init.js`), not a package-name import — both files are siblings in one package now.

This task is pure mechanical relocation — no content rewrites yet (Tasks 2–5 rewrite `paths.js`/`config.js`/`init.js`/`update.js` at their new location, once they're already there).

- [ ] **Step 1: Move the files**

```bash
git mv excalibur/bin/excalibur.js bin/excalibur.js
git mv excalibur/src src
git mv create-excalibur/bin/create-excalibur.js bin/create-excalibur.js
git mv create-excalibur/onboarding onboarding
rmdir excalibur/bin excalibur/src excalibur create-excalibur/bin create-excalibur
```

(If `rmdir` fails because a directory isn't empty, `ls` it — something wasn't moved. Don't force-delete; find and move the leftover file first.)

- [ ] **Step 2: Fix `bin/create-excalibur.js`'s import**

Change:
```javascript
import { init } from 'excalibur/src/commands/init.js'
```
to:
```javascript
import { init } from '../src/commands/init.js'
```

- [ ] **Step 3: Write the merged root `package.json`**

Read the current `excalibur/package.json` and `create-excalibur/package.json` first (their content is now at `bin/`/`src/`/`onboarding/` relative to the repo root, per Step 1) to confirm dependencies are identical (they are, per the design spec's Context section) before replacing. Full new root `package.json`:

```json
{
  "name": "excalibur",
  "version": "0.3.0",
  "description": "A ready-to-use SDD (Spec-Driven Development) framework for AI agents",
  "license": "MIT",
  "type": "module",
  "bin": {
    "excalibur": "bin/excalibur.js",
    "create-excalibur": "bin/create-excalibur.js"
  },
  "engines": {
    "node": ">=18"
  },
  "files": [
    "bin/",
    "src/",
    "lib/",
    "rules/",
    "reflection/",
    "harnesses/",
    "onboarding/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "check": "node bin/excalibur.js check",
    "postinstall": "node scripts/postinstall.js"
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

(`scripts.postinstall` is added here now, pointing at a file Task 6 creates — harmless to reference before it exists, since `postinstall` only runs on `npm install`, not during this plan's own `node --check` validation. Version bumped to `0.3.0` — this is a breaking change to the install model, same reasoning as the `0.1.x`→`0.2.x` bump during the repo reorganization.)

- [ ] **Step 4: Remove the stale `package-lock.json` at the root, if present**

```bash
test -f package-lock.json && git rm package-lock.json || echo "no stale lockfile"
```
(It described the old `excalibur-monorepo` marker's empty dependency set — regenerate a real one after Task 9's verification, not now, since the package will keep changing through this plan.)

- [ ] **Step 5: Confirm every `.js` file still parses (paths.js/config.js will fail until Tasks 2–3 — that's expected)**

```bash
node --check bin/excalibur.js
node --check bin/create-excalibur.js
find src -name "*.js" -exec node --check {} \;
```
Expected: all pass. Nothing in this task's move touches file *content*, so nothing should fail yet.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: merge excalibur and create-excalibur into one package"
git push origin main
```

---

### Task 2: Rewrite `src/lib/paths.js`

**Files:**
- Modify: `src/lib/paths.js` (full rewrite)

**Interfaces:**
- Produces: `packageRoot` (unchanged name, now resolves 2 levels up instead of 3 — `src/lib` → `src` → repo root, since Task 1 removed the extra `excalibur/` nesting level).
- Produces: `locateConfig(cwd)` → `{ mode: 'public'|'discreet', file: <absolute path> } | null`.
- Produces: `projectPaths(cwd)` → `{ root, mode, configured, configFile, base, customDir, custom, customManifest, context, vscode, gitignore }`. `base` is always `packageRoot`. `configured` is `true` only when `locateConfig(cwd)` found something — this REPLACES every prior `exists(paths.base)` "is this project onboarded" check in every command (`base` now always exists, since it's wherever the running code itself lives).
- Produces: `DEFAULT_CUSTOM_DIR = '.overrides'`, `CONTEXT_DIR = 'context'`, `PUBLIC_CONFIG_FILE = 'excalibur.yaml'`, `PACKAGE_JSON = 'package.json'`, `CUSTOM_MANIFEST_FILE = 'manifest.yaml'`, `harnessTargets` (unchanged from today).
- Consumes: `parse` from `./yaml.js` (already exists, unchanged).

Removed from the old `paths.js` (do not reintroduce): `ownRoot`, `onboardingManifestPath`, `shippedFolders`, `BASE_DIR`, `CUSTOM_DIR`, `CONFIG_FILE`, `SESSION_FILE`, `ANSWERS_FILE`, `CUSTOM_MANIFEST`.

- [ ] **Step 1: Write the full new file**

```javascript
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { parse } from './yaml.js'

/**
 * Every path the CLI knows about, in one place.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

/**
 * Root of the running excalibur package — wherever npm actually put it. In a real
 * consuming project this already IS `node_modules/excalibur/`, because the code
 * currently executing (this very file) lives inside that installed package — no
 * separate lookup needed. Content (`lib/`, `rules/`, `reflection/`, `harnesses/`,
 * `onboarding/`) ships inside the same package at the same root, so this one
 * constant is also the content source. There is no copy step: nothing is ever
 * written under `packageRoot` by any command — it's read-only package content,
 * exactly like the rest of `node_modules`.
 */
export const packageRoot = path.resolve(here, '..', '..')

export const CONTEXT_DIR = 'context'
export const DEFAULT_CUSTOM_DIR = '.overrides'
export const PUBLIC_CONFIG_FILE = 'excalibur.yaml'
export const PACKAGE_JSON = 'package.json'
export const CUSTOM_MANIFEST_FILE = 'manifest.yaml'

/** Where each harness actually reads its files from, inside a target project. */
export const harnessTargets = {
  claude: {
    agents: path.join('.claude', 'agents'),
    skills: path.join('.claude', 'skills'),
  },
}

/**
 * Finds this project's config, wherever it lives, and says which mode it implies.
 * Public: `excalibur.yaml` at the project root. Discreet: an `"excalibur"` key
 * inside the project's own `package.json`. Checks both locations — a caller never
 * needs to already know the mode before it can find the config that states it.
 * Returns `null` for a project that hasn't been scaffolded yet.
 */
export function locateConfig(cwd) {
  const publicPath = path.join(cwd, PUBLIC_CONFIG_FILE)
  if (fs.existsSync(publicPath)) return { mode: 'public', file: publicPath }

  const pkgPath = path.join(cwd, PACKAGE_JSON)
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      if (pkg.excalibur) return { mode: 'discreet', file: pkgPath }
    } catch {
      // A malformed package.json is treated the same as "no config" — not a crash.
    }
  }

  return null
}

/** Reads just enough of the config to resolve paths — custom_dir and mode. */
function loadPathConfig(cwd) {
  const located = locateConfig(cwd)
  if (!located) return { mode: 'public', customDir: DEFAULT_CUSTOM_DIR, located: null }

  try {
    if (located.mode === 'public') {
      const doc = parse(fs.readFileSync(located.file, 'utf8'))
      return { mode: doc.mode ?? 'public', customDir: doc.custom_dir ?? DEFAULT_CUSTOM_DIR, located }
    }
    const pkg = JSON.parse(fs.readFileSync(located.file, 'utf8'))
    const doc = pkg.excalibur ?? {}
    return { mode: doc.mode ?? 'discreet', customDir: doc.custom_dir ?? DEFAULT_CUSTOM_DIR, located }
  } catch {
    return { mode: located.mode, customDir: DEFAULT_CUSTOM_DIR, located }
  }
}

/**
 * Absolute paths inside a target project.
 *
 * `base` is always `packageRoot` — read-only, never written to. `configured` is
 * `true` only when a config was actually found; every command that used to check
 * `exists(paths.base)` to mean "is this project onboarded" must check
 * `paths.configured` instead, since `base` now always exists (it's wherever the
 * currently-running code lives).
 */
export function projectPaths(cwd) {
  const { mode, customDir, located } = loadPathConfig(cwd)

  return {
    root: cwd,
    mode,
    configured: Boolean(located),
    configFile: located?.file ?? null,
    base: packageRoot,
    customDir,
    custom: path.join(cwd, customDir),
    customManifest: path.join(cwd, customDir, CUSTOM_MANIFEST_FILE),
    context: path.join(cwd, customDir, CONTEXT_DIR),
    vscode: path.join(cwd, '.vscode'),
    gitignore: path.join(cwd, '.gitignore'),
  }
}
```

- [ ] **Step 2: Validate syntax**

```bash
node --check src/lib/paths.js
```
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/paths.js
git commit -m "refactor: make paths.js config-driven, drop the copy-based base dir"
git push origin main
```

(`config.js`, `init.js`, `update.js` and the other commands still import the now-removed constants at this point — Tasks 3–7 fix each. This is an intentionally broken intermediate state between commits within this plan; nothing outside this plan's own execution runs against it.)

---

### Task 3: Rewrite `src/lib/config.js`

**Files:**
- Modify: `src/lib/config.js` (full rewrite)

**Interfaces:**
- Consumes: `locateConfig`, `projectPaths`, `packageRoot`, `PUBLIC_CONFIG_FILE`, `PACKAGE_JSON`, `CUSTOM_MANIFEST_FILE` from `./paths.js` (Task 2).
- Produces: `frameworkVersion()` (unchanged behavior, reads `packageRoot/package.json`), `loadManifest()` (now reads `packageRoot/onboarding/manifest.yaml` — no more `create-excalibur/onboarding/` cross-package path), `defaultAnswers(manifest)` (unchanged), `readConfig(cwd)` → the whole config document or `null`, `writeConfig(cwd, config)` → writes to `excalibur.yaml` or the `package.json` `"excalibur"` key based on `config.mode`, `updateConfig(cwd, patch)` → read-patch-write helper (patch is an object merged shallowly into the current config, or a function `(current) => next`), `readCustomManifest`/`writeCustomManifest`/`syncCustomManifest` (same behavior, now resolve against `paths.customManifest` instead of a fixed `.excalibur.custom/manifest.yaml`), `resolveSddPath`/`writeSddMarker`/`SDD_MARKER_FILE` (unchanged), `SESSION_FLAGS` (unchanged).
- Removed from the old `config.js` (do not reintroduce as separate functions — folded into `readConfig`/`updateConfig`): `readAnswers`, `writeAnswers`, `readSession`, `writeSession`.

- [ ] **Step 1: Write the full new file**

```javascript
import fs from 'node:fs'
import path from 'node:path'
import { locateConfig, projectPaths, packageRoot, PUBLIC_CONFIG_FILE, PACKAGE_JSON, CUSTOM_MANIFEST_FILE } from './paths.js'
import { parse, stringify } from './yaml.js'
import { writeText, listFiles } from './fsx.js'

/** Version of the installed framework, read from the package's own package.json. */
export function frameworkVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version
  } catch {
    return '0.0.0'
  }
}

/** The manifest that drives onboarding — ships inside this same package now. */
export function loadManifest() {
  return parse(fs.readFileSync(path.join(packageRoot, 'onboarding', 'manifest.yaml'), 'utf8'))
}

/** Every question resolved to its default — the "use the defaults" path. */
export function defaultAnswers(manifest) {
  const answers = {}
  for (const q of manifest.questions ?? []) answers[q.id] = q.default
  return answers
}

/**
 * Reads the whole config document, wherever it lives (`excalibur.yaml` in public
 * mode, the `package.json` `"excalibur"` key in discreet mode). `null` for a project
 * that hasn't been scaffolded yet.
 */
export function readConfig(cwd) {
  const located = locateConfig(cwd)
  if (!located) return null

  try {
    if (located.mode === 'public') {
      return parse(fs.readFileSync(located.file, 'utf8'))
    }
    const pkg = JSON.parse(fs.readFileSync(located.file, 'utf8'))
    return pkg.excalibur ?? null
  } catch {
    return null
  }
}

/**
 * Writes the whole config document. `config.mode` decides where: `excalibur.yaml`
 * at the project root for `'public'`, or the `"excalibur"` key of the project's own
 * `package.json` for `'discreet'` — read-modify-write, touching no other
 * `package.json` field.
 */
export function writeConfig(cwd, config) {
  if (config.mode === 'discreet') {
    const pkgPath = path.join(cwd, PACKAGE_JSON)
    const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : {}
    pkg.excalibur = config
    writeText(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    return
  }

  const publicPath = path.join(cwd, PUBLIC_CONFIG_FILE)
  const header = [
    '# excalibur.yaml — project configuration.',
    '#',
    '# base_dir and custom_dir are recorded here for documentation, not because',
    '# anything reads them back to resolve paths — base_dir is always wherever the',
    '# excalibur package itself is installed (node_modules/excalibur/), and custom_dir',
    '# is read directly by every command that needs it.',
    '#',
    '# Written by `npx create-excalibur`. Safe to edit by hand — `excalibur update`',
    '# only overwrites the `framework_version` field, and `excalibur session` only',
    '# the `session` field.',
    '',
  ].join('\n')
  writeText(publicPath, header + stringify(config))
}

/**
 * Read-patch-write. `patch` is either an object shallow-merged into the current
 * config's top level, or a function `(current) => next` for anything deeper (e.g.
 * setting one key inside `session.flags` without clobbering the rest of `session`).
 * Returns the config that was written.
 */
export function updateConfig(cwd, patch) {
  const current = readConfig(cwd) ?? {}
  const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
  writeConfig(cwd, next)
  return next
}

/** The index of what has been customized — metadata only, never content. */
export function readCustomManifest(cwd) {
  const p = projectPaths(cwd)
  if (!fs.existsSync(p.customManifest)) return { version: 1, customized: [] }
  try {
    const doc = parse(fs.readFileSync(p.customManifest, 'utf8'))
    return { version: doc.version ?? 1, customized: doc.customized ?? [] }
  } catch {
    return { version: 1, customized: [] }
  }
}

export function writeCustomManifest(cwd, manifest) {
  const p = projectPaths(cwd)
  const header = [
    `# Index of which paths under ${p.customDir}/ are customized.`,
    '#',
    '# Metadata only — the customized content stays in normal files at the same relative',
    '# path. This exists so a caller can see what to apply without walking the tree.',
    '#',
    '# Updated automatically by `excalibur customize`.',
    '',
  ].join('\n')
  writeText(p.customManifest, header + stringify(manifest))
}

/** Rebuilds the index from what is actually on disk — the disk is the truth. */
export function syncCustomManifest(cwd) {
  const p = projectPaths(cwd)
  const files = listFiles(p.custom).filter((f) => f !== CUSTOM_MANIFEST_FILE)
  const manifest = { version: 1, customized: files.sort() }
  if (files.length > 0 || fs.existsSync(p.customManifest)) writeCustomManifest(cwd, manifest)
  return manifest
}

/** The nine session flags, from section 21. */
export const SESSION_FLAGS = {
  'dont-ask-me': 'Decide at ambiguous points instead of stopping to ask',
  'dry-run': 'Report what would happen; write and commit nothing',
  'skip-prober': 'Skip the prober interview this session',
  'skip-review': 'Skip the review checklist this session',
  'no-history': 'Write nothing to history.yaml this session',
  'strict-rules': 'Apply global and stack rules strictly; fail the task on a violation',
  'budget-limit': 'Token/cost ceiling for the session (takes a value)',
  'read-history': 'Set to `always` to pull task history into every handoff',
  'explain-decisions': 'Justify every relevant decision out loud',
}

/**
 * Hidden, empty marker file dropped inside the SDD destination. Its only job is to
 * survive a folder rename so a later session can still find the SDD by scanning for
 * it, instead of guessing from a folder name — see `lib/pipeline/sdd-path-recovery.md`.
 */
export const SDD_MARKER_FILE = '.excalibur-sdd-marker'

/**
 * Best-effort literal SDD path from the collected answers, where it's derivable
 * without the post-manifest interpretation step. `embedded` and `separate` are
 * deterministic from `cwd` alone; `external` and `new_repo` need a path only that
 * step resolves, so those come back `null` here.
 */
export function resolveSddPath(cwd, answers) {
  switch (answers?.destination) {
    case 'embedded':
      return path.join(cwd, '.sdd')
    case 'separate':
      return path.join(path.dirname(cwd), `${path.basename(cwd)}-sdd`)
    default:
      return null
  }
}

/**
 * Writes the empty marker file inside the SDD destination, if that destination
 * already exists.
 */
export function writeSddMarker(sddPath) {
  if (!sddPath || !fs.existsSync(sddPath)) return false
  writeText(path.join(sddPath, SDD_MARKER_FILE), '')
  return true
}
```

- [ ] **Step 2: Validate syntax**

```bash
node --check src/lib/config.js
```
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/config.js
git commit -m "refactor: fold config, answers and session into one document"
git push origin main
```

---

### Task 4: Rewrite `src/commands/init.js`

**Files:**
- Modify: `src/commands/init.js` (full rewrite)

**Interfaces:**
- Consumes: `packageRoot`, `projectPaths`, `DEFAULT_CUSTOM_DIR`, `CONTEXT_DIR`, `locateConfig` from `../lib/paths.js` (Tasks 2). `writeConfig`, `loadManifest`, `defaultAnswers`, `frameworkVersion`, `resolveSddPath`, `writeSddMarker` from `../lib/config.js` (Task 3). `build` from `../lib/build.js` (unchanged — verify in Step 4 below, not rewritten by this plan).
- Produces: `installFeatureFragments(cwd, answers)`, `writeClaudeMd(cwd, mode)` (now takes `mode` — public/discreet content differs) — both still exported for `update.js` (Task 5) to reuse, same as today.
- New CLI flags this command reads: `args.discreet` (boolean), `args.custom` (boolean) — both via `mri`'s existing boolean-flag parsing in `bin/excalibur.js`/`bin/create-excalibur.js` (Task 1 already merged the binaries; confirm `--discreet`/`--custom` are in the `boolean` array passed to `mri` in both bin files — if not, add them there too as part of this task).

- [ ] **Step 1: Add `--discreet` and `--custom` to both bin files' flag parsing**

Read `bin/excalibur.js` and `bin/create-excalibur.js` first. Both call `mri(process.argv.slice(2), { boolean: [...] })` — add `'discreet'` and `'custom'` to that boolean array in both files if not already present (they aren't, per the design spec — these are new flags).

- [ ] **Step 2: Write the full new `init.js`**

```javascript
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { packageRoot, projectPaths, DEFAULT_CUSTOM_DIR, CONTEXT_DIR, locateConfig } from '../lib/paths.js'
import {
  copyFile,
  ensureDir,
  exists,
  writeText,
  ensureGitignore,
} from '../lib/fsx.js'
import {
  loadManifest,
  defaultAnswers,
  writeConfig,
  frameworkVersion,
  resolveSddPath,
  writeSddMarker,
} from '../lib/config.js'
import { build } from '../lib/build.js'

/**
 * `excalibur init` (via `create-excalibur` or re-run directly) — collect answers,
 * write the config, build the harness files. No framework content is copied
 * anywhere: `build()` resolves `lib/`/`rules/`/etc. straight from `packageRoot`
 * (wherever npm installed this package) every time.
 */

async function askQuestion(question) {
  const options = (question.options ?? []).map((o) => ({
    value: o.value,
    label: o.label,
    hint: o.value === question.default ? 'default' : undefined,
  }))

  const answer = await p.select({
    message: question.prompt,
    options,
    initialValue: question.default,
  })

  if (p.isCancel(answer)) return { cancelled: true }

  const chosen = (question.options ?? []).find((o) => o.value === answer)

  if (chosen?.free_text) {
    const text = await p.text({
      message: `${question.prompt} — describe it:`,
      placeholder: 'Your own words',
    })
    if (p.isCancel(text)) return { cancelled: true }
    return { value: answer, text: String(text) }
  }

  return { value: answer }
}

/**
 * Checks BEFORE writing anything, the way create-vite does. There's no big folder
 * to offer "remove vs. ignore" for anymore — just a config to overwrite or not.
 */
async function checkExistingInstall(cwd) {
  const located = locateConfig(cwd)
  if (!located) return 'continue'

  p.log.warn(`A config already exists: ${pc.yellow(path.relative(cwd, located.file))} (mode: ${located.mode}).`)

  const choice = await p.select({
    message: 'How should this be handled?',
    options: [
      { value: 'cancel', label: 'Cancel operation', hint: 'nothing is written' },
      { value: 'overwrite', label: 'Overwrite the existing config and continue' },
    ],
    initialValue: 'cancel',
  })

  if (p.isCancel(choice) || choice === 'cancel') return 'cancel'
  return 'continue'
}

/**
 * Installs the standing-context fragment for each opt-in feature the manifest
 * answers turned on. Read in FULL, every session — unlike architecture/, which is
 * pulled selectively per handoff. One manifest answer per feature gates one
 * lib/features/<feature>.md fragment; Obsidian is the first, not the only one.
 * Lives under the custom-overrides folder now (context/ is project-writable
 * content, never under packageRoot).
 */
export function installFeatureFragments(cwd, answers) {
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
 * CLAUDE.md is regenerated by every init/update — Claude Code's one automatically-
 * read entry point, so it's what points a brand-new session at the Excalibur flow.
 * Discreet mode's wording never names "Excalibur" or "SDD" — that's the one visible
 * file discreet mode can't avoid writing (removing it would break Claude Code's own
 * session loading), so its CONTENT carries the discretion instead.
 */
export function writeClaudeMd(cwd, mode) {
  const paths = projectPaths(cwd)
  const claudeMdPath = path.join(cwd, 'CLAUDE.md')

  const lines = mode === 'discreet'
    ? [
        '# CLAUDE.md',
        '',
        'Before doing anything else:',
        '',
        `1. Read every file in \`${paths.customDir}/${CONTEXT_DIR}/\` in full, if that`,
        '   folder has any files — those are standing project context that applies',
        '   to every session.',
        `2. Follow \`node_modules/excalibur/lib/pipeline/entrypoint.md\` for how to`,
        '   handle any implementation request.',
        '',
        `This file is regenerated automatically — don't hand-edit it.`,
        '',
      ]
    : [
        '# CLAUDE.md',
        '',
        'This project uses Excalibur (SDD). Before doing anything else:',
        '',
        `1. Read every file in \`${paths.customDir}/${CONTEXT_DIR}/\` in full, if that`,
        '   folder has any files — those are standing project context that applies',
        '   to every session (installed by \`create-excalibur\` for the features',
        '   this project opted into, e.g. Obsidian integration).',
        `2. Follow \`node_modules/excalibur/lib/pipeline/entrypoint.md\` for how to`,
        '   handle any implementation request — it defines the four pipeline layers',
        '   (orchestrator → spec → implement → review) and which ones a given task',
        '   actually needs.',
        '',
        `This file is regenerated by \`excalibur update\` — don't hand-edit it.`,
        'Project-specific standing instructions belong in a `lib/features/`',
        'fragment (ask for one to be added) or in your SDD destination, not here.',
        '',
      ]

  writeText(claudeMdPath, lines.join('\n'))
}

export async function init(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur init ')))

  const decision = await checkExistingInstall(cwd)
  if (decision === 'cancel') {
    p.cancel('Nothing was written.')
    return 1
  }

  const configMode = args.discreet ? 'discreet' : 'public'

  let customDir = DEFAULT_CUSTOM_DIR
  if (args.custom) {
    const answer = await p.text({
      message: 'Name for the overrides folder (where your customizations live)?',
      placeholder: DEFAULT_CUSTOM_DIR,
      initialValue: DEFAULT_CUSTOM_DIR,
    })
    if (p.isCancel(answer)) {
      p.cancel('Nothing was written.')
      return 1
    }
    customDir = String(answer).trim() || DEFAULT_CUSTOM_DIR
  }

  const manifest = loadManifest()
  let mode = 'defaults'
  let answers = defaultAnswers(manifest)
  const freeText = {}

  if (args.yes) {
    p.log.info('Running with --yes: every question resolved to its default.')
  } else {
    const chosenMode = await p.select({
      message: manifest.master.prompt,
      options: manifest.master.options.map((o) => ({
        value: o.value,
        label: o.label,
        hint: o.value === manifest.master.default ? 'default' : undefined,
      })),
      initialValue: manifest.master.default,
    })

    if (p.isCancel(chosenMode)) {
      p.cancel('Nothing was written.')
      return 1
    }
    mode = chosenMode

    if (mode === 'customize') {
      for (const question of manifest.questions ?? []) {
        const result = await askQuestion(question)
        if (result.cancelled) {
          p.cancel('Nothing was written.')
          return 1
        }
        answers[question.id] = result.value
        if (result.text) freeText[question.id] = result.text
      }
    } else {
      p.log.info(
        'Using the defaults:\n' +
          (manifest.questions ?? []).map((q) => `  ${q.id}: ${pc.dim(q.default)}`).join('\n'),
      )
    }
  }

  const payload = { ...answers }
  for (const [id, text] of Object.entries(freeText)) payload[`${id}_text`] = text

  // customDir has to be resolved before projectPaths(cwd) can find the right
  // context/ folder — write the config FIRST, then everything else can call
  // projectPaths(cwd) normally and get the right paths back.
  const sddPath = resolveSddPath(cwd, answers)
  writeSddMarker(sddPath)

  writeConfig(cwd, {
    version: 1,
    mode: configMode,
    base_dir: 'node_modules/excalibur',
    custom_dir: customDir,
    framework_version: frameworkVersion(),
    setup_mode: mode,
    answers: payload,
    sdd_path: sddPath,
    session: { flags: {} },
  })

  const spinner = p.spinner()
  spinner.start('Building harness files')
  const built = build(cwd)
  spinner.stop(`Built ${built.agents.length} agents and ${built.skills.length} skill files`)

  const installedFeatures = installFeatureFragments(cwd, answers)
  writeClaudeMd(cwd, configMode)

  const paths = projectPaths(cwd)
  // Nothing needs a default gitignore entry anymore — there's no more disposable
  // .excalibur/ copy, and `custom_dir` is meant to be committed in both modes. Only
  // the optional history-archive entries are ever added, same as before.
  const ignored = []
  if (answers.history_gitignore === 'ignored') ignored.push('history.yaml', 'history/archive/')
  const added = ignored.length ? ensureGitignore(paths.gitignore, ignored, 'Excalibur') : []

  p.note(
    [
      `${pc.green('✓')} ${configMode === 'discreet' ? 'package.json ("excalibur" key)' : 'excalibur.yaml'}   project config`,
      `${pc.dim('·')} ${paths.customDir}/     your overrides (commit this)`,
      added.length ? `${pc.green('✓')} .gitignore             + ${added.join(', ')}` : '',
      installedFeatures.length
        ? `${pc.green('✓')} ${paths.customDir}/${CONTEXT_DIR}/     ${installedFeatures.join(', ')} standing context`
        : '',
      `${pc.green('✓')} CLAUDE.md              entrypoint the harness reads every session`,
    ]
      .filter(Boolean)
      .join('\n'),
    'Written',
  )

  p.outro(
    `Next: run ${pc.cyan('/excalibur-init')} in your harness — it picks up the answers and finishes onboarding.`,
  )
  return 0
}
```

Note: `writeVscodeFiles` (the old `.vscode/settings.json` `files.associations` trick) is dropped entirely — `excalibur.yaml` already has a real `.yaml` extension, so no syntax-highlighting workaround is needed, and discreet mode has no separate config file to associate. If the `.vscode/extensions.json` icon-theme recommendation is still wanted, that's a separate, smaller re-add — out of scope for this task (not mentioned in the design spec as something to preserve).

The `ensureGitignore` call's old `${BASE_DIR}/` entry is gone (there's nothing to gitignore anymore — `node_modules/` is already conventionally gitignored by the target project itself, and `excalibur.yaml`/`custom_dir` are meant to be committed).

- [ ] **Step 3: Validate syntax**

```bash
node --check src/commands/init.js
```
Expected: no output, exit code 0.

- [ ] **Step 4: Confirm `build.js` needs no changes**

Read `src/lib/build.js` and `src/lib/resolve.js`. Both call `projectPaths(cwd)` and use only `.base`/`.custom` — which still exist with the same names on the object Task 2's `projectPaths()` returns, just resolved differently. Confirm neither file imports any of the removed constants (`BASE_DIR`, `CUSTOM_DIR`, `shippedFolders`, etc.) — if either does, that's a plan gap; fix it inline the same way this task fixes `init.js`, and note the fix in your report.

- [ ] **Step 5: Smoke test (partial — `update.js`/other commands aren't fixed yet, so only test `init` standalone)**

```bash
rm -rf /tmp/excalibur-init-smoke && mkdir -p /tmp/excalibur-init-smoke && cd /tmp/excalibur-init-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" init --yes
test -f excalibur.yaml && echo "OK: excalibur.yaml written"
test -f CLAUDE.md && echo "OK: CLAUDE.md written"
grep -q "node_modules/excalibur" CLAUDE.md && echo "OK: CLAUDE.md points at node_modules/excalibur"
test -f .claude/agents/translator.md && echo "OK: agents built"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-init-smoke
```
Expected: all `OK:` lines print. This works even though `packageRoot` here resolves to the repo root itself (self-hosting), not a real `node_modules/excalibur` — that's expected and fine; Task 9 exercises the real `node_modules` path via `create-excalibur`.

- [ ] **Step 6: Commit**

```bash
git add bin/excalibur.js bin/create-excalibur.js src/commands/init.js
git commit -m "feat: rewrite init for no-copy build and public/discreet modes"
git push origin main
```

---

### Task 5: Rewrite `src/commands/update.js`

**Files:**
- Modify: `src/commands/update.js` (full rewrite)

**Interfaces:**
- Consumes: `projectPaths` from `../lib/paths.js`. `readConfig`, `updateConfig`, `frameworkVersion`, `syncCustomManifest` from `../lib/config.js`. `orphanedCustomizations` from `../lib/resolve.js`. `build` from `../lib/build.js`. `installFeatureFragments`, `writeClaudeMd` from `./init.js` (Task 4 — same import pattern as before, just the functions' own signatures changed slightly: `writeClaudeMd` now takes `mode`).

- [ ] **Step 1: Write the full new file**

```javascript
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { readConfig, updateConfig, frameworkVersion, syncCustomManifest } from '../lib/config.js'
import { orphanedCustomizations } from '../lib/resolve.js'
import { build } from '../lib/build.js'
import { installFeatureFragments, writeClaudeMd } from './init.js'

/**
 * `excalibur update` — rebuild `.claude/agents/`+`.claude/skills/` from the current
 * package content + overrides, and refresh `CLAUDE.md` + feature fragments.
 *
 * There's no framework folder to re-copy anymore — `build()` already resolves
 * straight from `packageRoot` every time it runs, so a plain `npm install`/`npm
 * update` of the `excalibur` package IS the update; this command (and the
 * `postinstall` hook that runs the same logic automatically) just re-runs the build
 * against whatever's now installed. It never touches the overrides folder.
 */
export async function update(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur update ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    p.cancel('No config found here. Run `npx create-excalibur` first.')
    return 1
  }

  const config = readConfig(cwd)
  const from = config?.framework_version ?? 'unknown'
  const to = frameworkVersion()

  const spinner = p.spinner()
  spinner.start(`Updating ${from} -> ${to}`)

  const savedAnswers = config?.answers ?? {}
  installFeatureFragments(cwd, savedAnswers)
  writeClaudeMd(cwd, paths.mode)

  spinner.stop('CLAUDE.md and feature context refreshed')

  const orphans = orphanedCustomizations(cwd)
  if (orphans.length) {
    p.log.warn(
      `${orphans.length} orphaned customization(s) — the matching file no longer exists in the package:\n` +
        orphans.map((o) => `  ${paths.customDir}/${o}`).join('\n') +
        '\n\nNothing was deleted. Review them by hand; they may just need moving.',
    )
  }

  syncCustomManifest(cwd)

  spinner.start('Rebuilding harness files')
  const built = build(cwd)
  spinner.stop(`Built ${built.agents.length} agents and ${built.skills.length} skill files`)

  updateConfig(cwd, { framework_version: to })

  p.outro(orphans.length ? `Updated, with ${orphans.length} thing(s) to look at.` : 'Updated.')
  return 0
}
```

- [ ] **Step 2: Validate syntax**

```bash
node --check src/commands/update.js
```
Expected: no output, exit code 0.

- [ ] **Step 3: Smoke test**

```bash
rm -rf /tmp/excalibur-update-smoke && mkdir -p /tmp/excalibur-update-smoke && cd /tmp/excalibur-update-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" init --yes >/dev/null 2>&1
node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" update
grep -q "framework_version:" excalibur.yaml && echo "OK: framework_version present after update"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-update-smoke
```
Expected: `update` exits 0, `OK:` line prints.

- [ ] **Step 4: Commit**

```bash
git add src/commands/update.js
git commit -m "feat: simplify update to a rebuild, no more folder re-copy"
git push origin main
```

---

### Task 6: Add the `postinstall` script

**Files:**
- Create: `scripts/postinstall.js`

**Interfaces:**
- Consumes: `update` from `../src/commands/update.js`, `locateConfig` from `../src/lib/paths.js`.

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
import { locateConfig } from '../src/lib/paths.js'
import { update } from '../src/commands/update.js'

/**
 * Runs automatically on `npm install` (wired as the `postinstall` script in
 * package.json). NOT a public `excalibur <verb>` — the CLI's command list is a
 * closed decision that doesn't include a build verb; this is an npm lifecycle hook
 * calling the same logic `excalibur update` exposes manually.
 *
 * `INIT_CWD` is what npm sets to the directory `npm install` was actually invoked
 * from — this script's own `cwd` is inside `node_modules/excalibur/`, not the
 * consuming project's root, since that's where npm runs every package's lifecycle
 * scripts. Known limitation, not solved here: pnpm/Yarn have their own (different)
 * lifecycle-script conventions and may not set INIT_CWD the same way, or may block
 * arbitrary postinstall scripts by default — this targets plain npm, matching every
 * other install-flow decision in this framework.
 */
async function main() {
  const targetCwd = process.env.INIT_CWD
  if (!targetCwd) {
    // No INIT_CWD at all means this isn't running under a normal `npm install` —
    // silently do nothing rather than guess at a directory.
    return
  }

  const located = locateConfig(targetCwd)
  if (!located) {
    // Either excalibur's own development install, or a package install that
    // hasn't been scaffolded with create-excalibur yet — nothing to rebuild.
    return
  }

  try {
    await update({}, targetCwd)
  } catch (error) {
    // A postinstall failure must never fail the whole `npm install` — the package
    // is still correctly installed even if the rebuild had a problem. Report it
    // and let `excalibur update` be run manually to see the real error.
    console.error('excalibur postinstall: rebuild failed, run `npx excalibur update` to see why:', error.message)
  }
}

main()
```

- [ ] **Step 2: Validate syntax**

```bash
node --check scripts/postinstall.js
```
Expected: no output, exit code 0.

- [ ] **Step 3: Simulate the postinstall run directly (can't trigger a real `npm install` lifecycle event without a real package install — test the script's own logic instead)**

```bash
rm -rf /tmp/excalibur-postinstall-smoke && mkdir -p /tmp/excalibur-postinstall-smoke && cd /tmp/excalibur-postinstall-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" init --yes >/dev/null 2>&1
INIT_CWD="$(pwd)" node "C:/Users/davisilva-ieg/Excalibur/scripts/postinstall.js"
echo "exit code: $?"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-postinstall-smoke
```
Expected: exit code 0, no error printed (the script runs `update` silently against the scaffolded project).

Also test the no-op path:
```bash
rm -rf /tmp/excalibur-postinstall-noop && mkdir -p /tmp/excalibur-postinstall-noop && cd /tmp/excalibur-postinstall-noop
INIT_CWD="$(pwd)" node "C:/Users/davisilva-ieg/Excalibur/scripts/postinstall.js"
echo "exit code: $?"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-postinstall-noop
```
Expected: exit code 0, no output at all (no config found, silent no-op).

- [ ] **Step 4: Commit**

```bash
git add scripts/postinstall.js
git commit -m "feat: add postinstall hook to rebuild automatically on npm install"
git push origin main
```

(`package.json`'s `scripts.postinstall` already points here, from Task 1 Step 3 — no `package.json` edit needed in this task.)

---

### Task 7: Fix the remaining 9 commands

**Files:**
- Modify: `src/commands/canvas.js`, `src/commands/customize.js`, `src/commands/diff.js`, `src/commands/doctor.js`, `src/commands/kill-my-self.js`, `src/commands/lint.js`, `src/commands/reset.js`, `src/commands/session.js`, `src/commands/status.js`

**Interfaces:**
- Consumes: the same `projectPaths`/`packageRoot`/`harnessTargets` from `../lib/paths.js` (Task 2) and `readConfig`/`updateConfig` from `../lib/config.js` (Task 3) every other rewritten command already uses. No new exports — this task only fixes call sites broken by Tasks 2–3 removing constants they used to import.

Each of these 9 files currently imports one or more of the constants Task 2 removed (`BASE_DIR`, `CUSTOM_DIR`, `CONFIG_FILE`, `SESSION_FILE`, `ANSWERS_FILE`, `shippedFolders`) and/or checks `exists(paths.base)` to mean "not onboarded yet" (now wrong, since `paths.base` — `packageRoot` — always exists). Fix each file exactly as follows.

- [ ] **Step 1: `src/commands/canvas.js`**

No logic change needed — it already imports only `packageRoot` (still exported, unchanged name) and builds `TEMPLATE` from it, which still resolves correctly (`packageRoot` now points at the repo root either way, just one directory level shallower than before Task 1 — the `path.join(packageRoot, 'lib', 'pipeline', 'project-canvas-template.canvas')` call is unaffected since `lib/` is still a direct child).

Only fix the stale doc-comment reference:
```javascript
// before:
 * exact file `create-excalibur/onboarding/manifest.yaml`-driven init would otherwise never place — when it
// after:
 * exact file `onboarding/manifest.yaml`-driven init would otherwise never place — when it
```

- [ ] **Step 2: `src/commands/customize.js`**

Change the import:
```javascript
// before:
import { projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
// after:
import { projectPaths } from '../lib/paths.js'
```

Then inside `customize()`, after `const paths = projectPaths(cwd)`, every use of `BASE_DIR`/`CUSTOM_DIR` becomes `paths.baseDir`/`paths.customDir` — but note `paths.baseDir` doesn't exist on the object Task 2 defined (only `paths.base`, the absolute path, and `paths.customDir`, the relative name). For the one `BASE_DIR` use (`Not found: ${BASE_DIR}/${rel}`), display `node_modules/excalibur` literally instead (it's always that, by construction now — no need for a stored relative name). Full replacement of the four affected lines:

```javascript
// before:
  if (!exists(source)) {
    p.cancel(`Not found: ${BASE_DIR}/${rel}`)
    return 1
  }

  if (exists(dest)) {
    p.log.warn(`Already customized: ${CUSTOM_DIR}/${rel}`)
// after:
  if (!exists(source)) {
    p.cancel(`Not found in the package: ${rel}`)
    return 1
  }

  if (exists(dest)) {
    p.log.warn(`Already customized: ${paths.customDir}/${rel}`)
```

```javascript
// before:
      `Edit: ${pc.cyan(CUSTOM_DIR + '/' + rel)}`,
      '',
      `Resolution is per file: everything else in that folder keeps coming from ${BASE_DIR}/.`,
      `\`excalibur update\` never touches ${CUSTOM_DIR}/, so this edit survives updates.`,
      `Commit ${CUSTOM_DIR}/ — it is real customization, unlike ${BASE_DIR}/.`,
// after:
      `Edit: ${pc.cyan(paths.customDir + '/' + rel)}`,
      '',
      `Resolution is per file: everything else keeps coming from the installed package.`,
      `\`excalibur update\` never touches ${paths.customDir}/, so this edit survives updates.`,
      `Commit ${paths.customDir}/ — it is real customization, the package content isn't.`,
```

- [ ] **Step 3: `src/commands/diff.js`**

Change the import:
```javascript
// before:
import { projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
// after:
import { projectPaths } from '../lib/paths.js'
```

Replace the onboarded check:
```javascript
// before:
  const paths = projectPaths(cwd)
  if (!exists(paths.base)) {
    if (!quiet) {
      p.log.warn(`No ${BASE_DIR}/ in this folder — not onboarded yet.`)
      p.outro('Run `npx excalibur init`.')
    }
    return 1
  }
// after:
  const paths = projectPaths(cwd)
  if (!paths.configured) {
    if (!quiet) {
      p.log.warn('No config found here — not onboarded yet.')
      p.outro('Run `npx create-excalibur`.')
    }
    return 1
  }
```

Replace the two remaining display uses:
```javascript
// before:
    if (!quiet) p.outro(`Nothing customized — ${CUSTOM_DIR}/ has no overrides yet.`)
// after:
    if (!quiet) p.outro(`Nothing customized — ${paths.customDir}/ has no overrides yet.`)
```
```javascript
// before:
      summary.push(`${pc.yellow('!')} ${f.path}  ${pc.yellow('orphaned — no matching file in ' + BASE_DIR + '/')}`)
// after:
      summary.push(`${pc.yellow('!')} ${f.path}  ${pc.yellow('orphaned — no matching file in the installed package')}`)
```

- [ ] **Step 4: `src/commands/doctor.js`**

Change the import:
```javascript
// before:
import { projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
// after:
import { projectPaths } from '../lib/paths.js'
```

Replace the onboarded check:
```javascript
// before:
  const paths = projectPaths(cwd)

  if (!exists(paths.base)) {
    if (!quiet) {
      p.log.warn(`No ${BASE_DIR}/ in this folder — not onboarded yet.`)
      p.outro('Run `npx excalibur init`.')
    }
    return 1
  }
// after:
  const paths = projectPaths(cwd)

  if (!paths.configured) {
    if (!quiet) {
      p.log.warn('No config found here — not onboarded yet.')
      p.outro('Run `npx create-excalibur`.')
    }
    return 1
  }
```

Replace the two `CUSTOM_DIR` display uses in check 1:
```javascript
// before:
    lines.push(`${pc.green('✓')} customizations   no orphans in ${CUSTOM_DIR}/`)
  } else {
    problems++
    lines.push(`${pc.red('✗')} customizations   ${orphans.length} orphaned file(s) in ${CUSTOM_DIR}/`)
    for (const o of orphans) lines.push(`    ${CUSTOM_DIR}/${o}`)
// after:
    lines.push(`${pc.green('✓')} customizations   no orphans in ${paths.customDir}/`)
  } else {
    problems++
    lines.push(`${pc.red('✗')} customizations   ${orphans.length} orphaned file(s) in ${paths.customDir}/`)
    for (const o of orphans) lines.push(`    ${paths.customDir}/${o}`)
```

- [ ] **Step 5: `src/commands/kill-my-self.js`**

This one needs real logic changes, not just display swaps — it must NEVER touch `paths.base` anymore (that's the installed npm package; deleting it would corrupt the project's own `node_modules`, not "uninstall Excalibur"). Full replacement:

```javascript
import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths, harnessTargets, locateConfig } from '../lib/paths.js'
import { exists, removeDir, removeFile, listFiles, writeText } from '../lib/fsx.js'

/**
 * `excalibur kill-my-self` — uninstall Excalibur from this project.
 *
 * Removes the config, the overrides folder, and the built harness files. Never
 * touches `node_modules/` — that's the installed package, not something this
 * command owns; `npm uninstall excalibur` is how that actually goes away. It also
 * never removes the SDD destination: specs, architecture and ideas are the
 * project's own knowledge, not part of the installation.
 */
export async function killMySelf(args, cwd) {
  p.intro(pc.bgRed(pc.white(' excalibur kill-my-self ')))

  const paths = projectPaths(cwd)
  const located = locateConfig(cwd)
  const targets = harnessTargets.claude

  const toRemove = [
    { label: paths.customDir + '/', target: paths.custom, dir: true },
    { label: path.join(cwd, 'CLAUDE.md'), target: path.join(cwd, 'CLAUDE.md'), dir: false },
    { label: targets.agents, target: path.join(cwd, targets.agents), dir: true },
    { label: targets.skills, target: path.join(cwd, targets.skills), dir: true },
  ].filter((item) => exists(item.target))

  if (!located && toRemove.length === 0) {
    p.outro('Excalibur is not installed here.')
    return 0
  }

  const customCount = exists(paths.custom) ? listFiles(paths.custom).filter((f) => f !== 'manifest.yaml').length : 0

  const configLabel = located
    ? located.mode === 'discreet'
      ? 'package.json ("excalibur" key removed, rest of the file kept)'
      : 'excalibur.yaml'
    : null

  p.note(
    [...(configLabel ? [configLabel] : []), ...toRemove.map((item) => item.label)].join('\n'),
    'Will be removed',
  )

  if (customCount > 0) {
    p.log.warn(
      `${customCount} customized file(s) in ${paths.customDir}/ will go with it. That folder is versioned, so git can bring it back — but only if it was committed.`,
    )
  }

  p.log.info('Your SDD content (specs, architecture, ideas) is NOT touched — it is your project, not the installation.')
  p.log.info('node_modules/excalibur is NOT removed — run `npm uninstall excalibur` for that, separately.')

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: 'Remove Excalibur from this project?',
      initialValue: false,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Nothing was removed.')
      return 1
    }
  }

  for (const item of toRemove) {
    if (item.dir) removeDir(item.target)
    else removeFile(item.target)
  }

  if (located?.mode === 'discreet') {
    const pkg = JSON.parse(fs.readFileSync(located.file, 'utf8'))
    delete pkg.excalibur
    writeText(located.file, JSON.stringify(pkg, null, 2) + '\n')
  } else if (located) {
    removeFile(located.file)
  }

  p.outro('Removed.')
  return 0
}
```

- [ ] **Step 6: `src/commands/lint.js`**

The old `findValidateScript`'s "prefer the project's materialized copy, fall back to the package's own" logic is now moot — there's only ever one copy, `packageRoot`'s own. Simplify:

```javascript
// before:
import { packageRoot, BASE_DIR } from '../lib/paths.js'
import { exists, listFiles } from '../lib/fsx.js'
...
function findValidateScript(cwd) {
  // Prefer the copy materialized inside the target project (.excalibur/lib/...),
  // since that's the version actually shipped to whoever runs `excalibur lint` in
  // their own CI. Fall back to the package's own copy — e.g. linting this repo itself.
  const inProject = path.join(cwd, BASE_DIR, 'lib', 'scripts', 'validate-md-size.sh')
  if (exists(inProject)) return inProject
  const inPackage = path.join(packageRoot, 'lib', 'scripts', 'validate-md-size.sh')
  if (exists(inPackage)) return inPackage
  return null
}
// after:
import { packageRoot } from '../lib/paths.js'
import { exists, listFiles } from '../lib/fsx.js'
...
function findValidateScript() {
  const script = path.join(packageRoot, 'lib', 'scripts', 'validate-md-size.sh')
  return exists(script) ? script : null
}
```

And update its one call site:
```javascript
// before:
function runSizeCheck(cwd, target) {
  const script = findValidateScript(cwd)
// after:
function runSizeCheck(target) {
  const script = findValidateScript()
```
```javascript
// before:
  const size = runSizeCheck(cwd, target)
// after:
  const size = runSizeCheck(target)
```

- [ ] **Step 7: `src/commands/reset.js`**

Session flags now live inside the config document, not a standalone file. Full replacement:

```javascript
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { readConfig, updateConfig } from '../lib/config.js'

/**
 * `excalibur reset` — clear the active session directives.
 *
 * Only touches the config's `session.flags`. Doesn't touch answers, framework
 * version, or anything else in the document.
 */
export async function reset(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur reset ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    p.outro('No config found here — nothing to reset.')
    return 0
  }

  const config = readConfig(cwd)
  const activeFlags = Object.keys(config?.session?.flags ?? {})

  if (activeFlags.length === 0) {
    p.outro('No session flags set — nothing to reset.')
    return 0
  }

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: 'Clear every session directive?',
      initialValue: true,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Left as is.')
      return 1
    }
  }

  updateConfig(cwd, (current) => ({ ...current, session: { flags: {} } }))
  p.outro('Session directives cleared — all flags back to default (off).')
  return 0
}
```

- [ ] **Step 8: `src/commands/session.js`**

Same change — reads/writes `config.session.flags` via `readConfig`/`updateConfig` instead of a standalone session file. Full replacement:

```javascript
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { readConfig, updateConfig, SESSION_FLAGS } from '../lib/config.js'

/**
 * `excalibur session <flag>` — set or clear a session directive.
 *
 * CLI only, no skill counterpart: this is metadata the orchestrator reads and passes
 * down through handoffs, not a conversation.
 */
export async function session(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur session ')))

  const config = readConfig(cwd)
  const flags = { ...(config?.session?.flags ?? {}) }
  const requested = args._[0]

  if (!requested) {
    const lines = Object.entries(SESSION_FLAGS).map(([flag, description]) => {
      const value = flags[flag]
      const state = value === undefined || value === false ? pc.dim('off') : pc.green(value === true ? 'on' : String(value))
      return `${state.padEnd(16)} ${flag.padEnd(18)} ${pc.dim(description)}`
    })
    p.note(lines.join('\n'), 'Session flags')
    p.outro('Set one with: npx excalibur session <flag> [value]  ·  clear with --off')
    return 0
  }

  const flag = String(requested)
  if (!(flag in SESSION_FLAGS)) {
    p.cancel(`Unknown flag: ${flag}\nKnown flags: ${Object.keys(SESSION_FLAGS).join(', ')}`)
    return 1
  }

  if (args.off) {
    delete flags[flag]
    updateConfig(cwd, (current) => ({ ...current, session: { flags } }))
    p.outro(`${flag} cleared.`)
    return 0
  }

  const value = args._[1]
  if (flag === 'budget-limit' || flag === 'read-history') {
    if (value === undefined) {
      p.cancel(
        flag === 'budget-limit'
          ? 'budget-limit needs a value: npx excalibur session budget-limit 50000'
          : 'read-history needs a value: npx excalibur session read-history always',
      )
      return 1
    }
    flags[flag] = value
  } else {
    flags[flag] = true
  }

  updateConfig(cwd, (current) => ({ ...current, session: { flags } }))
  p.note(`${flag} = ${pc.green(String(flags[flag]))}`, 'Set')
  p.outro('Written. The orchestrator reads it at the start of every session.')
  return 0
}
```

- [ ] **Step 9: `src/commands/status.js`**

Change the import:
```javascript
// before:
import { projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
// after:
import { projectPaths } from '../lib/paths.js'
```

Replace the onboarded check:
```javascript
// before:
  const paths = projectPaths(cwd)

  if (!exists(paths.base)) {
    p.log.warn(`No ${BASE_DIR}/ in this folder — not onboarded yet.`)
    p.outro('Run `npx excalibur init`.')
    return 1
  }
// after:
  const paths = projectPaths(cwd)

  if (!paths.configured) {
    p.log.warn('No config found here — not onboarded yet.')
    p.outro('Run `npx create-excalibur`.')
    return 1
  }
```

Add the mode to the summary and fix the `CUSTOM_DIR` display use:
```javascript
// before:
  const lines = [
    `version      ${installed}${installed !== current ? pc.yellow(`  (package has ${current} — run update)`) : ''}`,
    `destination  ${answers.destination ?? pc.dim('unknown')}`,
    `language     ${answers.language ?? pc.dim('unknown')}`,
    `autonomy     ${answers.autonomy ?? pc.dim('unknown')}`,
    `customized   ${customized.length} file(s) in ${CUSTOM_DIR}/`,
  ]
// after:
  const lines = [
    `version      ${installed}${installed !== current ? pc.yellow(`  (package has ${current} — run update)`) : ''}`,
    `mode         ${paths.mode}`,
    `destination  ${answers.destination ?? pc.dim('unknown')}`,
    `language     ${answers.language ?? pc.dim('unknown')}`,
    `autonomy     ${answers.autonomy ?? pc.dim('unknown')}`,
    `customized   ${customized.length} file(s) in ${paths.customDir}/`,
  ]
```

And the remaining two `CUSTOM_DIR`/`BASE_DIR` display uses:
```javascript
// before:
    p.note(customized.map((f) => `${pc.dim(CUSTOM_DIR + '/')}${f}`).join('\n'), 'Customized files')
  }

  const orphans = orphanedCustomizations(cwd)
  if (orphans.length) {
    p.log.warn(
      `${orphans.length} orphaned customization(s) — no matching file in ${BASE_DIR}/:\n` +
        orphans.map((o) => `  ${CUSTOM_DIR}/${o}`).join('\n'),
// after:
    p.note(customized.map((f) => `${pc.dim(paths.customDir + '/')}${f}`).join('\n'), 'Customized files')
  }

  const orphans = orphanedCustomizations(cwd)
  if (orphans.length) {
    p.log.warn(
      `${orphans.length} orphaned customization(s) — no matching file in the installed package:\n` +
        orphans.map((o) => `  ${paths.customDir}/${o}`).join('\n'),
```

- [ ] **Step 10: Validate syntax on all 9 files**

```bash
for f in canvas customize diff doctor kill-my-self lint reset session status; do
  node --check "src/commands/$f.js" && echo "OK $f.js" || echo "FAIL $f.js"
done
```
Expected: `OK` for all 9.

- [ ] **Step 11: Smoke test the trickiest ones — customize, session, reset, kill-my-self**

```bash
rm -rf /tmp/excalibur-cmd-smoke && mkdir -p /tmp/excalibur-cmd-smoke && cd /tmp/excalibur-cmd-smoke && git init -q
node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" init --yes >/dev/null 2>&1

node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" customize rules/global/kiss.md
test -f .overrides/rules/global/kiss.md && echo "OK: customize wrote into .overrides/"

node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" session skip-review
grep -q "skip-prober\|session:" excalibur.yaml && echo "OK: excalibur.yaml has a session section"

node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" status --quiet 2>&1 | grep -q "mode" && echo "OK: status shows mode"

node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" reset --yes

node "C:/Users/davisilva-ieg/Excalibur/bin/excalibur.js" kill-my-self --yes
test -f excalibur.yaml && echo "STILL THERE (bad)" || echo "OK: excalibur.yaml removed"
test -d .overrides && echo "STILL THERE (bad)" || echo "OK: .overrides removed"

cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-cmd-smoke
```
Expected: every `OK:` line prints, no `STILL THERE (bad)` lines, no `FAIL`.

- [ ] **Step 12: Commit**

```bash
git add src/commands/canvas.js src/commands/customize.js src/commands/diff.js src/commands/doctor.js src/commands/kill-my-self.js src/commands/lint.js src/commands/reset.js src/commands/session.js src/commands/status.js
git commit -m "fix: update the remaining commands for config-driven paths"
git push origin main
```

---

### Task 8: Rename `Excalibur.example`, update docs

**Files:**
- Move: `docs/repo/Excalibur.example` → `docs/repo/excalibur.yaml.example`
- Modify: `docs/repo/structure.md`

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Read the current example file, then rewrite it to the new config shape**

Read `docs/repo/Excalibur.example` first to see its current content and comment style, then replace it with an example matching the new unified config document (public mode — mention discreet mode's different location in a comment at the top, don't duplicate the whole example for both modes):

```bash
git mv docs/repo/Excalibur.example docs/repo/excalibur.yaml.example
```

Then write `docs/repo/excalibur.yaml.example`'s content as a realistic filled-in example: `version: 1`, `mode: public`, `base_dir: node_modules/excalibur`, `custom_dir: .overrides`, `framework_version` (a plausible version string), `setup_mode: customize`, a small `answers:` block with 3-4 representative fields (`destination`, `language`, `github_preset`, `autonomy` — whatever the actual manifest questions from `onboarding/manifest.yaml` are called; read that file to get real field names, don't invent them), `sdd_path`, and `session: { flags: {} }`. Add one top-level comment explaining that in discreet mode this whole document lives under `package.json`'s `"excalibur"` key instead of a standalone file.

- [ ] **Step 2: Update `docs/repo/structure.md`**

Read the file, then update: the tree no longer shows separate `excalibur/` and `create-excalibur/` folders — replace with `bin/`, `src/`, `lib/`, `rules/`, `reflection/`, `harnesses/`, `onboarding/`, `scripts/` (new, for `postinstall.js`) all directly at the repo root. Fix any prose describing the two-package split to describe the merged single package with two `bin` entries instead. Fix any reference to `Excalibur.example` → `excalibur.yaml.example`.

- [ ] **Step 3: Sweep for stale references**

```bash
grep -rln "excalibur/src\|excalibur/bin\|create-excalibur/onboarding\|create-excalibur/bin\|Excalibur\.example\|\.excalibur/" --include="*.md" --include="*.js" --include="*.yaml" . | grep -v "^\./.docs/" | grep -v "^\./.superpowers/"
```
For every hit outside the excluded historical-docs folders, read it and fix the reference to match the new tree (this will likely include `lib/pipeline/entrypoint.md` and other `lib/`/`rules/`/`harnesses/` content that mentions `create-excalibur/onboarding/` by path, plus anything still saying `.excalibur/` — every one of those needs to become either `node_modules/excalibur/...` or a reference to the config, per what Tasks 2–7 already changed in code). Re-run the grep after fixing; expected empty (outside the excluded dirs).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: update structure.md and the config example for the merged package"
git push origin main
```

---

### Task 9: Full end-to-end verification

**Files:**
- None — verification only. Fix anything this step finds, in whichever file actually needs it, before committing.

- [ ] **Step 1: Real `npm install` + public mode scaffold**

```bash
cd "C:/Users/davisilva-ieg/Excalibur" && rm -f package-lock.json && npm install
rm -rf /tmp/excalibur-e2e-public && mkdir -p /tmp/excalibur-e2e-public && cd /tmp/excalibur-e2e-public && git init -q
npm init -y >/dev/null 2>&1
npm install "C:/Users/davisilva-ieg/Excalibur" >/dev/null 2>&1
test -d node_modules/excalibur/lib && echo "OK: package content present in node_modules/excalibur"
node node_modules/excalibur/bin/create-excalibur.js --yes
test -f excalibur.yaml && echo "OK: public config written"
test -f .claude/agents/translator.md && echo "OK: agents built from node_modules"
node node_modules/.bin/excalibur doctor --quiet
node node_modules/.bin/excalibur status --quiet
cd "C:/Users/davisilva-ieg/Excalibur"
```
Expected: every `OK:` line prints, `doctor`/`status` exit without crashing. **Do not delete `/tmp/excalibur-e2e-public` yet** — Step 3 reuses it.

- [ ] **Step 2: Discreet mode scaffold, separately**

```bash
rm -rf /tmp/excalibur-e2e-discreet && mkdir -p /tmp/excalibur-e2e-discreet && cd /tmp/excalibur-e2e-discreet && git init -q
npm init -y >/dev/null 2>&1
npm install "C:/Users/davisilva-ieg/Excalibur" >/dev/null 2>&1
node node_modules/excalibur/bin/create-excalibur.js --yes --discreet
test -f excalibur.yaml && echo "STILL THERE (bad)" || echo "OK: no excalibur.yaml in discreet mode"
grep -q '"excalibur"' package.json && echo "OK: config is in package.json"
grep -qi "sdd\|Excalibur" CLAUDE.md && echo "STILL NAMES SDD/EXCALIBUR (bad)" || echo "OK: CLAUDE.md wording is generic"
test -f .claude/agents/translator.md && echo "OK: agents built"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-e2e-discreet
```
Expected: all `OK:` lines, no `(bad)` lines. If the `CLAUDE.md` check fails, re-read Task 4's `writeClaudeMd` discreet branch — it's meant to avoid exactly those words.

- [ ] **Step 3: `--custom` flag, using the public-mode project from Step 1**

```bash
rm -rf /tmp/excalibur-e2e-custom && mkdir -p /tmp/excalibur-e2e-custom && cd /tmp/excalibur-e2e-custom && git init -q
npm init -y >/dev/null 2>&1
npm install "C:/Users/davisilva-ieg/Excalibur" >/dev/null 2>&1
# --custom needs the extra prompt answered non-interactively — pipe the folder name in, since --yes alone skips the manifest but not this one extra question
echo "my-tweaks" | node node_modules/excalibur/bin/create-excalibur.js --yes --custom
grep -q "custom_dir: my-tweaks" excalibur.yaml && echo "OK: custom folder name honored" || (echo "check excalibur.yaml by hand:"; cat excalibur.yaml)
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-e2e-custom /tmp/excalibur-e2e-public
```
Expected: `OK:` line prints. If `@clack/prompts`' `p.text` doesn't read from a piped stdin the way this assumes, investigate the actual behavior and adjust the test invocation (not the feature) — report what you find either way.

- [ ] **Step 4: `postinstall` fires on a real `npm install` of a NEW version**

```bash
rm -rf /tmp/excalibur-e2e-postinstall && mkdir -p /tmp/excalibur-e2e-postinstall && cd /tmp/excalibur-e2e-postinstall && git init -q
npm init -y >/dev/null 2>&1
npm install "C:/Users/davisilva-ieg/Excalibur" >/dev/null 2>&1
node node_modules/excalibur/bin/create-excalibur.js --yes >/dev/null 2>&1
rm -rf .claude
npm install "C:/Users/davisilva-ieg/Excalibur" 2>&1 | tail -5
test -f .claude/agents/translator.md && echo "OK: postinstall rebuilt .claude/agents/ automatically" || echo "FAIL: postinstall did not rebuild"
cd "C:/Users/davisilva-ieg/Excalibur" && rm -rf /tmp/excalibur-e2e-postinstall
```
Expected: `OK:` line prints — a plain `npm install` (re-installing the same local package, which npm still runs lifecycle scripts for) regenerated `.claude/agents/` with no explicit `excalibur update` call.

- [ ] **Step 5: Repo-wide syntax check**

```bash
cd "C:/Users/davisilva-ieg/Excalibur"
find . -name "node_modules" -prune -o -name "*.js" -print | while read -r f; do node --check "$f" >/dev/null 2>&1 || echo "FAIL $f"; done
find . -name "node_modules" -prune -o -name "*.sh" -print | while read -r f; do bash -n "$f" || echo "FAIL $f"; done
```
Expected: no `FAIL` lines.

- [ ] **Step 6: Commit a fresh `package-lock.json` if `npm install` at the repo root (Step 1) regenerated one**

```bash
git status --short package-lock.json
```
If it shows as new/modified:
```bash
git add package-lock.json
```

- [ ] **Step 7: Final commit and push**

```bash
git add -A
git status
git commit -m "test: verify the full public/discreet/custom/postinstall flow end to end"
git push origin main
```
(If Steps 1–5 found nothing to fix, there may be nothing beyond the lockfile to commit here — that's fine, commit what actually changed.)
