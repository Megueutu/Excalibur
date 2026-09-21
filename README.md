# Excalibur

A ready-to-use **SDD (Spec-Driven Development) framework** for AI agents. Instead of reinventing a process for every new project, you run a guided onboarding (the **Wizard**) once, and the project gets a fixed implementation pipeline — task classification, specs when they're warranted, and a final review checklist — for every task that follows.

Currently targets Claude / Claude Code. The architecture keeps the framework content harness-agnostic so other harnesses can be added later.

## Install

Excalibur is never installed by cloning this repository. The CLI does the installing:

```bash
npm install --save-dev @easy-spec/excalibur
npx @easy-spec/excalibur check    # verify dependencies (bash, git, gh, node)
npx @easy-spec/excalibur init     # collect answers, write the config into the target project
```

Then, inside your harness, run `/excalibur-init` to finish onboarding conversationally.

## How the pieces fit

| Folder | What it is |
|---|---|
| [`packages/cli/`](packages/cli/) | The executable package: both entry points, commands and shared CLI core |
| [`onboarding/`](onboarding/) | Data for one-time onboarding: the question manifest, `init.sh`, presets copied based on the answers |
| [`lib/`](lib/) | Framework content: `agents/`, `personas/`, `pipeline/` and opt-in `features/` |
| [`rules/`](rules/) | Distributable rules: `global/` principles, per-`stacks/` recommendations, and `heuristics/` (mechanical yaml checks) |
| [`reflection/`](reflection/) | How to *think* while producing a spec — reasoning chain and when to pause |
| [`harnesses/`](harnesses/) | Thin per-harness adapters (skills). Today: `claude/` only |
| [`scripts/`](scripts/) | All executable support scripts: detection, Git/GitHub, history and the npm `postinstall` hook |
| [`docs/repo/`](docs/repo/) | Documentation about this repository itself — not shipped to target projects |

`onboarding/`, `lib/pipeline/` and `rules/` are the source of truth for content. `packages/cli/` reads and builds that content without keeping a second copy.

## What lands in a project you onboard

| Path | Versioned? | What it holds |
|---|---|---|
| `node_modules/@easy-spec/excalibur/` | no (managed by npm) | The installed package: framework content, read directly, never copied |
| `.overrides/` (configurable via `custom_dir`) | yes | Your overrides, per file. `update` never touches it |
| `excalibur.yaml` (public mode) or the `"excalibur"` key in `package.json` (discreet mode) | yes | The project config: mode, paths, onboarding answers, session flags |
| *(your chosen SDD folder)* | yes | The actual SDD content: specs, architecture, ideas |

The first three are the framework's machinery; the last one is your project's content, and you pick its name and location during onboarding.

## Documentation

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to set up the repository and contribute
- [`docs/repo/purpose.md`](docs/repo/purpose.md) — why this exists
- [`docs/repo/structure.md`](docs/repo/structure.md) — how the repository is organized
- [`docs/repo/git.md`](docs/repo/git.md) — commit conventions for this repository
- [`.docs/IMPLEMENTATION_PLAN.md`](.docs/IMPLEMENTATION_PLAN.md) / [`.docs/IMPLEMENTATION_NOTES.md`](.docs/IMPLEMENTATION_NOTES.md) / [`.docs/PENDENCIAS.md`](.docs/PENDENCIAS.md) — build status and open questions

## License

MIT — see [`LICENSE`](LICENSE).
