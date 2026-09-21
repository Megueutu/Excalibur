# What Excalibur is for

Excalibur is a ready-to-use **SDD (Spec-Driven Development) framework** for AI agents. It exists so that a developer doesn't reinvent the process on every new project: they run a guided onboarding once, and the project gets a fixed implementation pipeline for every task that follows.

It solves three problems:

1. **The process is rebuilt from scratch every time.** Onboarding (the Wizard) asks how *this* project wants to work — git, language, review depth, commit convention, testing policy, CI — and materializes the answers as real files.
2. **Agents work with partial context.** The SDD is not just instructions for the agent; it is the project's living documentation — architecture, ideas, specs, decisions — kept readable by a human (Obsidian) and cheap for an agent to load.
3. **Multi-agent work gets expensive fast.** Orchestrator, spec, implementation and review each cost tokens. The framework is deliberately built around a small handoff, a stable cacheable prefix, and history that is never read unless asked for.

## What it is NOT

- **Not a place for business context.** Excalibur never stores a real project's content inside itself. Specs, architecture and ideas live in that project's SDD destination, never in this repository.
- **Not the code of the projects it serves.** Each project stays in its own repository.
- **Not installed by cloning.** The CLI installs it (`npx excalibur init`), the same way OpenSpec, Spec Kit and BMad Method all do it.
- **Not tied to one harness.** Today only Claude Code has an adapter, and the framework content is kept harness-agnostic so that stays true.

## Two things that are easy to confuse

| | Where | Versioned? |
|---|---|---|
| **The framework's machinery** | `node_modules/excalibur/` + the overrides folder (`custom_dir`) + the config (`excalibur.yaml` or `package.json`'s `"excalibur"` key) | `node_modules/excalibur/` no, the rest yes |
| **The project's SDD content** | a folder the user names during onboarding | yes |

The first is an installation, regenerated on demand like `node_modules/`. The second is the project's actual knowledge, and losing it would matter. They are independent on purpose.

See [`structure.md`](structure.md) for how this maps to folders.
