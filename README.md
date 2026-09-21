# Excalibur

A ready-to-use **SDD (Spec-Driven Development) framework** for AI agents. Instead of reinventing a process for every new project, you run a guided onboarding (the **Wizard**) once, and the project gets a fixed implementation pipeline — task classification, specs when they're warranted, and a final review checklist — for every task that follows.

Currently targets Claude / Claude Code. The architecture keeps the framework content harness-agnostic so other harnesses can be added later.

## Install

Excalibur is never installed by cloning this repository. The CLI does the installing:

```bash
npx excalibur check    # verify dependencies (bash, git, gh, node)
npx excalibur init     # collect answers, materialize .excalibur/ into the target project
```

Then, inside your harness, run `/excalibur-init` to finish onboarding conversationally.

## How the pieces fit

| Folder | What it is |
|---|---|
| [`create-excalibur/`](create-excalibur/) | Scaffold package (`npm create excalibur`): one-time onboarding — the question manifest, `onboarding/init.sh`, presets and shell scripts |
| [`excalibur/`](excalibur/) | Ongoing CLI package (`npx excalibur ...`): `init`, `update`, `status`, `doctor`, `lint`, `check`, `clean-history` |
| [`lib/`](lib/) | Framework libraries: `agents/` (internal agent catalog, YAML source files), `pipeline/` (implementation process itself), `scripts/` (shell helpers) and `features/` (opt-in feature fragments) |
| [`rules/`](rules/) | Distributable rules: `global/` principles, per-`stacks/` recommendations, and `heuristics/` (mechanical yaml checks) |
| [`reflection/`](reflection/) | How to *think* while producing a spec — reasoning chain and when to pause |
| [`harnesses/`](harnesses/) | Thin per-harness adapters (skills). Today: `claude/` only |
| [`docs/repo/`](docs/repo/) | Documentation about this repository itself — not shipped to target projects |

`create-excalibur/onboarding/`, `lib/pipeline/` and `rules/` are the source of truth for content; `excalibur/` and `create-excalibur/` only package and copy them.

## What lands in a project you onboard

| Path | Versioned? | What it holds |
|---|---|---|
| `.excalibur/` | no (gitignored) | The framework's default content. Overwritten on every `excalibur update` |
| `.excalibur.custom/` | yes | Your overrides, per file. `update` never touches it |
| `Excalibur` | yes | Root config file, no extension, YAML content |
| `.excalibur-session.yaml` | optional | Session directives read by the orchestrator |
| *(your chosen SDD folder)* | yes | The actual SDD content: specs, architecture, ideas |

The first four are the framework's machinery; the last one is your project's content, and you pick its name and location during onboarding.

## Documentation

- [`docs/repo/purpose.md`](docs/repo/purpose.md) — why this exists
- [`docs/repo/structure.md`](docs/repo/structure.md) — how the repository is organized
- [`docs/repo/git.md`](docs/repo/git.md) — commit conventions for this repository
- [`.docs/IMPLEMENTATION_PLAN.md`](.docs/IMPLEMENTATION_PLAN.md) / [`.docs/IMPLEMENTATION_NOTES.md`](.docs/IMPLEMENTATION_NOTES.md) / [`.docs/PENDENCIAS.md`](.docs/PENDENCIAS.md) — build status and open questions

## License

MIT — see [`LICENSE`](LICENSE).
