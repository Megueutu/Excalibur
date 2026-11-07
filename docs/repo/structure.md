# Repository structure

```
Excalibur/
  package.json              a single npm-publishable package — two bin entries, one tree
  packages/
    cli/
      excalibur.js           the ongoing, per-task CLI entry point
      create-excalibur.js    one-time onboarding entry point (`npx create-excalibur`)
      commands/              one file per command in the CLI reference
    core/                    override resolution, build, paths, minimal YAML (shared by the CLI and the desktop app)
  lib/
    agents/                  the internal agent catalog, one .yaml each
    personas/                short behaviors composed into agent output
    pipeline/                the implementation process
    modules/                 optional modules a project turns on or off (excalibur module)
    onboarding/              manifest, wizard flow and presets
    reflection/              how to reason while producing a spec
    scripts/                 executable helpers and the npm postinstall hook
  rules/                     rules shipped into projects
    global/                  KISS, YAGNI, DRY, SOLID
    stacks/                  per language / framework / IDE, combinable
    heuristics/              machine-checked tables (mechanical YAML, not prose rules)
  harnesses/
    claude/skills/           the only implemented harness adapter
      task-types/             one skill per conventional-commit task type (feat, fix, refactor, ...)
  docs/
    repo/                    documentation about this repository (not shipped)
  .superpowers/               local, gitignored-by-default working state for the superpowers skills (briefs, reports, progress notes)
  scratchpad/                 local scratch space for temporary files, not part of the shipped framework
  bootstrap-check.ps1         the one .ps1 wrapper in the repo — checks whether `bash` is on PATH before any .sh script runs
```

## Which layer does new content belong to?

| Layer | Rule for deciding |
|---|---|
| `packages/cli/` | Executable Node code for both CLI entry points, their commands and shared core. Never framework content. |
| `lib/onboarding/` | Data for one-time onboarding only: the questions manifest and the pre-written files it can copy. If it runs on every task instead of once, it belongs in `lib/pipeline/`. |
| `lib/pipeline/` | What agents do on every task. Must be 100% generic — if it names a project, org or repo, it doesn't belong here. |
| `lib/modules/` | Optional modules. Each is a folder with a `module.yaml` (name, description, default, requires) plus `context/`, `agents/` and `skills/` it contributes. The active list is `modules:` in the project config; manage it with `excalibur module add\|remove\|list`, or `init --with/--without`. A project defines its own at `<custom_dir>/lib/modules/<name>/`. |
| `lib/modes/` | Work modes (`deep`, `ant-brain`, `vibecode`). Each has a `mode.yaml` and a `mode.md` that is installed as standing context while the mode is active (`excalibur mode <name>`; `off` removes it). |
| `lib/reflection/lenses/` | One short file per concern (reversibility, failure modes, data lifecycle, boundaries, trust, user impact, simplicity, observability). Modes point at the lenses to read; they load on demand, never all at once. |
| `rules/` | Content that gets copied into a user's project. If it's about maintaining *this* repository, it goes to `docs/repo/` instead. |
| `rules/heuristics/` | Mechanical, machine-checked tables — read by a script or agent that needs a fixed answer without reasoning it out. Still shipped, like the rest of `rules/`. |
| `lib/reflection/` | How to reason while writing a spec, as opposed to what to do in what order. |
| `harnesses/<harness>/` | Only the trigger plus a pointer. Never a second copy of `lib/pipeline/`. |
| `docs/repo/` | About this repository. Never shipped to a project. |

## Two rules that are easy to get wrong

**`rules/` is shipped; `docs/repo/` is not.** Anything under `rules/` (including `rules/heuristics/`) is read directly by a consuming project out of `node_modules/@easy-spec/excalibur/rules/` — nothing is ever copied there. A note about how to maintain this repository, or a record of how a feature was planned, has no business appearing there.

**`packages/cli/` doesn't duplicate content.** `lib/` and `rules/` are the single source of truth, read at the project root by both CLI entry points. If a rule's text appears inside the CLI package, that's a bug.

## No per-folder README convention

Earlier revisions of this repository required a short `README.md` in every top-level folder (and weighty subfolders). That convention was dropped — it added noise without enough payoff to justify keeping every one current as the tree moved. `excalibur doctor` no longer checks for them, and nothing else enforces the convention.

Only the repository root keeps its `README.md` — the entry point for anyone landing on the repo.

## Where development planning lives

Plans, design decisions, implementation notes and open questions for building Excalibur itself are kept outside this repository, so the framework carries none of its own development SDD.

## The SDD skeleton

A task folder is generated, not hand-written: `excalibur new <repo> <task-slug>` writes `proposal.md`, `spec.md`, `design.md` and `tasks.yaml` from the fenced blocks in `lib/pipeline/spec-template.md`, with the frontmatter filled in. `excalibur lint` then checks every task folder under `specs/`: required frontmatter keys, allowed values, and names matching the folder. The structure is enforced by code, so it holds with or without any module.
