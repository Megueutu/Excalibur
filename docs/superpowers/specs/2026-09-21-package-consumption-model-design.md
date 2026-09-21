# Package consumption model — public/discreet installs, no-copy build — design

## Context

Today (`excalibur/` + `create-excalibur/`, split in an earlier round): `excalibur init` copies the package's `lib/`/`rules/`/`reflection/`/`harnesses/` content into a target project's `.excalibur/` folder, then builds `.claude/agents/`+`.claude/skills/` from that copy. The copy step exists only because `lib/`/`rules/`/`reflection/`/`harnesses/` live at the **monorepo root**, outside the `excalibur/` package folder — a deliberate deferral (`PENDENCIAS.md` item 5) made when this was still a two-package split with no real `npm install` consumption path.

The user now wants real `node_modules`-based consumption: no copy, no `.excalibur/`, resolve straight from wherever `npm install` actually puts the package. That requires the package to be genuinely self-contained, which reopens item 5 now rather than later. Alongside that, two new requirements: a **discreet** install mode that leaves no visible trace of using an SDD framework, and a **postinstall** hook so a plain `npm install` keeps `.claude/agents/`/`.claude/skills/` current without a manual step.

This spec covers the full consumption model change. It does not cover UI/UX polish of the `create-excalibur` prompts beyond what's needed for the new flags, and does not cover a real npm registry publish (still deferred — this makes local/`file:`-based consumption fully real, which is what registry publish would also need, but doesn't submit anything to a registry).

## Closed decisions

- **One package again, two binaries.** `excalibur/` and `create-excalibur/` merge back into a single package at the repo root: `package.json` (name `excalibur`, `bin: { excalibur, "create-excalibur" }`), `bin/excalibur.js`, `bin/create-excalibur.js`, `src/` (CLI code, unchanged internal shape), and — moving in from the repo root — `lib/`, `rules/`, `reflection/`, `harnesses/`, `onboarding/` (renamed from `create-excalibur/onboarding/`). The `excalibur/` and `create-excalibur/` subfolders are deleted; their contents land directly at the repo root. `npm create excalibur` keeps working the same way from the consumer's side — npm resolves it to whatever's published as `create-excalibur`, which is now just this package's second `bin` entry rather than a separate package.

- **No more materialized `.excalibur/`.** `excalibur/src/lib/build.js` resolves `lib/agents/`, `lib/pipeline/`, etc. directly from wherever the package is actually installed (`node_modules/excalibur/` in a real consuming project; the repo root itself when developing Excalibur on itself) layered under the custom-overrides folder — no intermediate copy. `excalibur init`/`update` stop copying framework folders; the only files an install still writes into the target project are the config, `CLAUDE.md`, the feature-context folder, and the built `.claude/agents/`+`.claude/skills/` output.

- **Two install modes, chosen by a CLI flag at scaffold time** (`npm create excalibur -- --discreet` for discreet; its absence is public, no separate flag needed):
  - **Public**: config lives at the project root as `excalibur.yaml`.
  - **Discreet**: config lives inside the project's own `package.json`, under an `"excalibur"` key. Nothing at the project root names Excalibur or SDD. `.claude/agents/`/`.claude/skills/` still exist as usual — those are Claude Code's own requirement, not something Excalibur controls, and hiding them would break the harness.
  - Both modes also fold `.excalibur-session.yaml` and `.excalibur-answers.yaml` into the same location as the main config (separate top-level keys, `session` and `answers`, inside the `excalibur.yaml` document or the `package.json` `"excalibur"` key) — one config location per mode, not three files in public mode and a mix in discreet. This weakens no existing capability (session directives and collected answers were already meant to be read as a small document, not appended to line by line) and keeps discreet mode's promise complete — a leftover `.excalibur-session.yaml` file would have been exactly the kind of visible trace discreet mode exists to avoid.
  - `CLAUDE.md` still gets written in both modes (removing it would break Claude Code's own session loading), but its content in discreet mode doesn't name "Excalibur" or "SDD" — generic language about following the project's configured workflow. Public mode's `CLAUDE.md` is unchanged.

- **Config format is self-describing about where things live.** `excalibur.yaml` (or the `package.json` `"excalibur"` key) carries `base_dir` (the resolved package location — effectively always `node_modules/excalibur`, but stored explicitly rather than hardcoded, so a future non-standard install layout isn't a hardcoded assumption) and `custom_dir` (the overrides folder name/path). Every path-resolving function reads these from config instead of assuming fixed constants.

- **Custom overrides folder name is user-choosable.** Default `.overrides/` in both modes. `npm create excalibur -- --custom` adds one onboarding question asking for a different name/path; without the flag, the question is never asked and the default is used silently. This flag is independent of `--discreet` — all four combinations are valid (`(none)`, `--discreet`, `--custom`, `--discreet --custom`).

- **`excalibur update` changes meaning.** It no longer re-copies framework folders (nothing to copy). It rebuilds `.claude/agents/`+`.claude/skills/` from the current package content + overrides, and refreshes `CLAUDE.md` + feature fragments — the same work the new postinstall hook does automatically, exposed as a manual command for `--dry-run`, non-npm package managers that skip lifecycle scripts, or re-running after hand-editing something under the overrides folder.

- **`postinstall` hook rebuilds automatically.** `package.json` gets a `postinstall` script pointing at a small internal script (not a public `excalibur <verb>` — the CLI's command list stays a closed set, per the earlier decision that a "build" verb doesn't belong in it). That script:
  1. Resolves the target project root via `process.env.INIT_CWD` (what npm sets to the directory `npm install` was actually invoked from — the package's own lifecycle scripts run with `cwd` inside `node_modules/excalibur`, not the consumer's root).
  2. Checks for `excalibur.yaml` or a `package.json` `"excalibur"` key at that root. If neither exists, this is either Excalibur's own development install or a package install that hasn't been scaffolded yet — no-op, exit 0 silently.
  3. If found, runs the same build the `update` command runs.
  - Known gap, not solved here: `INIT_CWD` and `postinstall` are an npm-specific mechanism. pnpm and Yarn have their own equivalents with different quirks (pnpm blocks arbitrary lifecycle scripts by default in recent versions). Out of scope — this spec targets plain `npm`, matching every other install-flow decision made so far in this framework.

- **`docs/repo/Excalibur.example`** is renamed to `docs/repo/excalibur.yaml.example` and rewritten to the new config shape (`mode`, `base_dir`, `custom_dir`, plus the existing manifest-answer fields, `session`, `answers`).

## Target tree

```
Excalibur/                      (repo root — now also the excalibur package root)
  package.json                  name: excalibur, bin: { excalibur, create-excalibur }
  bin/
    excalibur.js
    create-excalibur.js
  src/
    commands/
    lib/                        paths.js, config.js, build.js, resolve.js, fsx.js, yaml.js
  lib/                           agents/, pipeline/, scripts/, features/     (content, unchanged internally)
  rules/
  reflection/
  harnesses/
  onboarding/                    moved from create-excalibur/onboarding/ — manifest.yaml, flow.md, init.sh, onboarding/
  docs/repo/
  .docs/
  ...
```

Target project, public mode, after `npm create excalibur`:

```
excalibur.yaml                 mode: public, base_dir, custom_dir, answers, session, other settings
CLAUDE.md
.overrides/                    (or whatever --custom named it)
.claude/agents/*.md
.claude/skills/**
node_modules/excalibur/        the installed package — lib/, rules/, reflection/, harnesses/, onboarding/, src/
<sdd destination>/
```

Target project, discreet mode:

```
package.json                   ..."excalibur": { mode: discreet, base_dir, custom_dir, answers, session, ... }
CLAUDE.md                       (generic wording, no "Excalibur"/"SDD" naming)
.overrides/
.claude/agents/*.md
.claude/skills/**
node_modules/excalibur/
<sdd destination>/
```

## Open (decide during implementation)

- Exact internal command name/entry point the `postinstall` script imports (e.g. a plain function export from `build.js`, reused directly — no new CLI verb).
- Whether `excalibur init`, re-run against an already-scaffolded project, should be idempotent (safe no-op / re-ask) or refuse — not specified by the user in this round; default to today's check-before-write behavior (refuse/offer options) unless implementation reveals a reason to change it.
- `src/lib/` (CLI helper modules) sitting alongside a top-level `lib/` (framework content) is a naming collision in spirit, not in path — flagged for awareness, not a blocker; renaming either is out of scope for this spec.
- Whether `.gitignore` needs a new entry for `.overrides/`-or-custom-name (it shouldn't be gitignored — overrides are meant to be committed, same as `.excalibur.custom/` was) — carry forward the existing non-gitignored behavior, just under the new configurable name.

## Roadmap

1. Merge `create-excalibur/` and `excalibur/` into the repo root: move `excalibur/bin/excalibur.js` → `bin/excalibur.js`, `excalibur/src/` → `src/`, `create-excalibur/bin/create-excalibur.js` → `bin/create-excalibur.js`, `create-excalibur/onboarding/` → `onboarding/` (renamed). Merge the two `package.json`s into one at the repo root (name `excalibur`, both `bin` entries, dependencies already identical between the two today — no reconciliation needed there). Delete the now-empty `excalibur/` and `create-excalibur/` subfolders. `lib/`, `rules/`, `reflection/`, `harnesses/` need no move at all — they already live at the repo root, which this step makes the package root too, so they're already exactly where the no-copy build needs them.
2. Rewrite `src/lib/paths.js` and `src/lib/config.js`: config-driven `base_dir`/`custom_dir` resolution, dual-location config load (`excalibur.yaml` vs `package.json` `"excalibur"` key), session/answers folded into the same config document.
3. Rewrite `src/lib/build.js`: resolve content from `base_dir` (now typically `node_modules/excalibur`, or the repo root when self-hosting) instead of a materialized `.excalibur/` copy.
4. Rewrite `commands/init.js`: writes `excalibur.yaml` or the `package.json` key depending on `--discreet`; writes `custom_dir` per `--custom`; drops the framework-folder copy step; still writes `CLAUDE.md` (mode-aware content) and feature fragments; still runs the first build.
5. Rewrite `commands/update.js`: drop the copy/prune logic, keep (simplify to) the rebuild step.
6. Add the `postinstall` script and wire it into `package.json`.
7. Update every other command (`doctor`, `status`, `canvas`, `diff`, `lint`, `list`, `customize`, `session`, `reset`, `clean`, `clean-history`, `kill-my-self`, `check`) for the new config shape and the absence of `.excalibur/`.
8. Rename and rewrite `docs/repo/Excalibur.example` → `excalibur.yaml.example`.
9. Update `docs/repo/structure.md` and any other cross-references to the old two-package tree.
10. Full end-to-end verification: public mode scaffold, discreet mode scaffold, `--custom` in both, a real `npm install` triggering `postinstall`, `excalibur update` manual rebuild, every command against both modes.

## General analysis checklist

- [x] Reuse checked — reuses the existing base+override resolution concept (`resolve.js`), just re-pointed at a config-driven `base_dir` instead of a hardcoded `.excalibur/`; reuses the existing build pipeline (`build.js`'s agent/skill assembly) unchanged in its assembly logic, only its source-resolution root changes.
- [x] Minimum scope — no registry publish, no pnpm/Yarn support, no UI polish beyond the two new flags.
- [ ] Applicable commit/PR rules — commits go straight to `main`, no PR, English, lowercase, per this session's standing instruction.
- [x] No change to the agent/persona work from the previous round — this spec only touches the installer/CLI layer, not `lib/agents/*` content.
