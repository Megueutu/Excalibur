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
| [`bin/`](bin/), [`src/`](src/) | The single CLI package's code — two entry points: `excalibur` (ongoing: `init`, `update`, `status`, `doctor`, `lint`, `check`, `clean-history`, ...) and `create-excalibur` (one-time onboarding) |
| [`onboarding/`](onboarding/) | Data for one-time onboarding: the question manifest, `init.sh`, presets copied based on the answers |
| [`lib/`](lib/) | Framework libraries: `agents/` (internal agent catalog, YAML source files), `pipeline/` (implementation process itself), `scripts/` (shell helpers) and `features/` (opt-in feature fragments) |
| [`rules/`](rules/) | Distributable rules: `global/` principles, per-`stacks/` recommendations, and `heuristics/` (mechanical yaml checks) |
| [`reflection/`](reflection/) | How to *think* while producing a spec — reasoning chain and when to pause |
| [`harnesses/`](harnesses/) | Thin per-harness adapters (skills). Today: `claude/` only |
| [`scripts/`](scripts/) | Repo-maintenance Node scripts — `postinstall.js` rebuilds the harness files automatically on `npm install` |
| [`docs/repo/`](docs/repo/) | Documentation about this repository itself — not shipped to target projects |

`onboarding/`, `lib/pipeline/` and `rules/` are the source of truth for content; `bin/`/`src/` only read and package them — nothing is copied into the target project at publish time, and nothing is copied into `bin/`/`src/` either.

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
