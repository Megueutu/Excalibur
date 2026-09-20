# Excalibur

A ready-to-use **SDD (Spec-Driven Development) framework** for AI agents. Instead of reinventing a process for every new project, you run a guided onboarding (the **Wizard**) once, and the project gets a fixed implementation pipeline — task classification, specs when they're warranted, and a final review checklist — for every task that follows.

Currently targets Claude / Claude Code. The architecture keeps the framework content harness-agnostic so other harnesses can be added later.

## Install

Excalibur is never installed by cloning this repository. The CLI does the installing:

```bash
npx excalibur check    # verify dependencies (bash, git, gh, node)
npx excalibur init     # collect answers, materialize .excalibur/ into the target project
```

Then, inside your harness, run `/excalibur-init` to finish onboarding conversationally. See [`cli/README.md`](cli/README.md) for the full command reference.

## How the pieces fit

| Folder | What it is |
|---|---|
| [`wizard/`](wizard/) | One-time onboarding: the question manifest, `init.sh`, presets and shell scripts |
| [`pipeline/`](pipeline/) | The implementation process itself |
| [`lib/agents/`](lib/agents/) | The internal agent catalog (YAML source files, built into `.claude/agents/` for Claude Code) |
| [`rules/`](rules/) | Distributable rules: global principles, per-stack recommendations, writing and naming conventions |
| [`reflection/`](reflection/) | How to *think* while producing a spec — reasoning chain and when to pause |
| [`harnesses/`](harnesses/) | Thin per-harness adapters (skills). Today: `claude/` only |
| [`cli/`](cli/) | The npm-publishable Node CLI that distributes and installs everything above |
| [`docs/repo/`](docs/repo/) | Documentation about this repository itself — not shipped to target projects |

`wizard/`, `pipeline/` and `rules/` are the source of truth for content; `cli/` only packages and copies them.

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
- [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) / [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) / [`PENDENCIAS.md`](PENDENCIAS.md) — build status and open questions

## License

MIT — see [`LICENSE`](LICENSE).
