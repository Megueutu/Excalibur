# Repository structure

```
Excalibur/
  package.json              a single npm-publishable package — two bin entries, one tree
  bin/
    excalibur.js              the ongoing, per-task CLI entry point
    create-excalibur.js        one-time onboarding entry point (`npx create-excalibur`)
  src/
    commands/                one file per command in the CLI reference
    lib/                     override resolution, build, paths, minimal YAML
  onboarding/                 manifest.yaml, init.sh, pre-written files copied based on the answers
  lib/
    agents/                  the internal agent catalog, one .yaml each
    pipeline/                the implementation process
    scripts/                 shell helpers (git/GitHub, OS, stack, history)
    features/                optional feature fragments a project can opt into
  rules/                     rules shipped into projects
    global/                  KISS, YAGNI, DRY, SOLID
    stacks/                  per language / framework / IDE, combinable
    heuristics/              machine-checked tables (mechanical YAML, not prose rules)
  reflection/                how to think while producing a spec
  harnesses/
    claude/skills/           the only implemented harness adapter
      task-types/             one skill per conventional-commit task type (feat, fix, refactor, ...)
  scripts/                   repo-maintenance Node scripts (postinstall.js: rebuild on install)
  docs/
    repo/                    documentation about this repository (not shipped)
  .docs/                     AI-assisted development process tracking (not shipped, hidden)
    superpowers/              plans and design specs produced while building this repo
    IMPLEMENTATION_PLAN*.md, IMPLEMENTATION_NOTES*.md, PENDENCIAS.md
  .superpowers/               local, gitignored-by-default working state for the superpowers skills (briefs, reports, progress notes)
  scratchpad/                 local scratch space for temporary files, not part of the shipped framework
  bootstrap-check.ps1         the one .ps1 wrapper in the repo — checks whether `bash` is on PATH before any .sh script runs
```

## Which layer does new content belong to?

| Layer | Rule for deciding |
|---|---|
| `bin/`, `src/` | Executable Node code for the CLI (both entry points: the ongoing `excalibur` command and the one-time `create-excalibur` onboarding command). Never framework *content* — it reads content from `lib/`, `rules/`, etc. straight out of wherever npm installed the package, it doesn't hold a second copy of it. |
| `onboarding/` | Data for one-time onboarding only: the questions manifest and the pre-written files it can copy. If it runs on every task instead of once, it belongs in `lib/pipeline/`. |
| `lib/pipeline/` | What agents do on every task. Must be 100% generic — if it names a project, org or repo, it doesn't belong here. |
| `lib/features/` | Optional fragments a project can opt into during onboarding, not part of the default pipeline. |
| `rules/` | Content that gets copied into a user's project. If it's about maintaining *this* repository, it goes to `docs/repo/` instead. |
| `rules/heuristics/` | Mechanical, machine-checked tables — read by a script or agent that needs a fixed answer without reasoning it out. Still shipped, like the rest of `rules/`. |
| `reflection/` | How to reason while writing a spec, as opposed to what to do in what order. |
| `harnesses/<harness>/` | Only the trigger plus a pointer. Never a second copy of `lib/pipeline/`. |
| `docs/repo/` | About this repository. Never shipped to a project. |
| `.docs/` | AI-assisted development process tracking for this repository (plans, design specs, implementation notes). Never shipped, and not a repo visitor's concern — hence hidden. |

## Two rules that are easy to get wrong

**`rules/` is shipped; `docs/repo/` and `.docs/` are not.** Anything under `rules/` (including `rules/heuristics/`) is read directly by a consuming project out of `node_modules/@easy-spec/excalibur/rules/` — nothing is ever copied there. A note about how to maintain this repository, or a record of how a feature was planned, has no business appearing there.

**`bin/`/`src/` don't duplicate content.** `lib/`, `rules/` and `reflection/` are the single source of truth, read at the project root by both CLI entry points. Neither entry point ever holds a second copy — if a rule's text ever appears inside `src/`, that's a bug.

## `docs/repo/` vs `.docs/`

Both are repo-maintenance documentation, never shipped — but they answer different questions. `docs/repo/` explains how Excalibur itself is organized today (purpose, structure, commit conventions) for anyone reading the repo. `.docs/` is the historical record of *how* that state was reached while building it with AI assistance (brainstorm specs, task plans, implementation notes, open TODOs) — useful for anyone reconstructing intent, not something a repo visitor needs to see, which is why it's hidden.

## No per-folder README convention

Earlier revisions of this repository required a short `README.md` in every top-level folder (and weighty subfolders). That convention was dropped — it added noise without enough payoff to justify keeping every one current as the tree moved. `excalibur doctor` no longer checks for them, and nothing else enforces the convention. The old per-folder READMEs weren't deleted outright — they were archived under `.docs/READMES/<dir>.md`, one file per folder, named after the directory it came from, so the content is still recoverable if a given folder's documentation is worth restoring or reworking later.

Only the repository root keeps its `README.md` — the entry point for anyone landing on the repo.
