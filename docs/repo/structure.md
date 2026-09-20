# Repository structure

```
Excalibur/
  Excalibur.example        sample of the root config file a project receives
  package.json             single package — CLI and framework content together
  cli/                     Node CLI: the distribution mechanism (npm-publishable)
    bin/excalibur.js
    src/commands/          one file per command in the CLI reference
    src/lib/               override resolution, build, paths, minimal YAML
  wizard/                  one-time onboarding
    manifest.yaml          every question, with a default per question
    init.sh                materializes the destination (embedded|separate|external)
    onboarding/            pre-written files copied based on the answers
    scripts/               shell helpers (git/GitHub, OS, stack, history)
  lib/
    agents/                the internal agent catalog, one .yaml each
    pipeline/              the implementation process
  rules/                   rules shipped into projects
    global/                KISS, YAGNI, DRY, SOLID
    stacks/                per language / framework / IDE, combinable
  reflection/              how to think while producing a spec
  harnesses/
    claude/skills/         the only implemented harness adapter
  docs/
    repo/                  documentation about this repository (not shipped)
    superpowers/           plans and design specs from building this repo
```

## Which layer does new content belong to?

| Layer | Rule for deciding |
|---|---|
| `cli/` | Executable Node code. Never framework *content* — the CLI copies content, it doesn't hold a second copy of it. |
| `wizard/` | Only runs once per project, during onboarding. If it runs on every task, it belongs in `lib/pipeline/`. |
| `lib/pipeline/` | What agents do on every task. Must be 100% generic — if it names a project, org or repo, it doesn't belong here. |
| `rules/` | Content that gets copied into a user's project. If it's about maintaining *this* repository, it goes to `docs/repo/` instead. |
| `reflection/` | How to reason while writing a spec, as opposed to what to do in what order. |
| `harnesses/<harness>/` | Only the trigger plus a pointer. Never a second copy of `lib/pipeline/`. |
| `docs/repo/` | About this repository. Never shipped to a project. |

## Two rules that are easy to get wrong

**`rules/` is shipped; `docs/repo/` is not.** Anything under `rules/` lands in someone else's project as `.excalibur/rules/`. A note about how to maintain this repository has no business being copied there.

**`cli/` doesn't duplicate content.** `wizard/`, `lib/pipeline/` and `rules/` are the single source of truth. The CLI packages and copies them — if a rule's text ever appears inside `cli/src/`, that's a bug.

## Every main folder has a README

A short `README.md` in each top-level folder (and in the subfolders that carry weight) explaining what it's for. That is a documentation convention for **this repository only** — it is not a rule imposed on projects that install Excalibur, and no review checklist enforces it there.
