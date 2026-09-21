# Core SDD — design

## Context

Excalibur today (state prior to this design) has `core/pipeline/` (implementation methodology: entrypoint, fix/feature/big feature classification, spec-template, review-checklist) and `projects/solaria/.contexto/` (Solaria-specific context, including already-written specs).

The user wants to expand Excalibur into several independent subsystems:
1. Core SDD (this design) — implementation pipeline + reflection chain + Obsidian-adapted specs + new-project bootstrap.
2. Distribution of ready-made skills/scripts for projects + skill/agent creation tooling.
3. Broader `rules/` (cross-cutting across both cores).

This document covers only core 1.

## Closed decisions

- **`core/` stops existing.** `pipeline/`, `reflection/`, `bootstrap/`, `harnesses/`, `rules/` become sibling folders at the root.
- **`pipeline/`** keeps its current scope (implementation process assuming the project's SDD already exists): `entrypoint.md`, `spec-template.md`, `review-checklist.md`. `reflection.md` moves out of here.
- **`reflection/` is new content, not just a rename.** Contains:
  - `reasoning-chain.md` — standard reasoning chain (context → hypotheses → validation → decision) applied by the agent when producing any spec. It's Excalibur's generated default; the user can override it later (override mechanism not yet designed — see "Open").
  - `when-to-pause.md` — content that is today `reflection.md` (when to stop and ask instead of deciding alone).
  - `README.md` — index.
- **`projects/` as a concept of "live data inside Excalibur" stops existing going forward.** A project's specs and context now live outside Excalibur: embedded in the project's own repo (e.g.: `.sdd/`, `docs/`, `specs/`) or in a separate repo (e.g.: `{repo-name}-sdd`), chosen at bootstrap time.
  - `projects/solaria/.contexto/` **stays as-is for now** — migration is a separate task, decided later.
- **`bootstrap/`** is the new process for creating a project's SDD from scratch (distinct from `pipeline/`, which assumes the SDD already exists). Contains:
  - `entrypoint.md` — question flow: where to materialize it (embedded vs. separate repo), adapt an existing project vs. start from scratch, presets (e.g.: how to handle GitHub — multiple predefined options + "specify").
  - `init.sh` — script that materializes the chosen structure, called by the agent after the wizard's answers.
- **Specs adapted for Obsidian**, no dedicated folder: `rules/writing-specs-obsidian.md` covers frontmatter/properties, wikilinks, vault-structure convention (folders/templates), and callouts; `pipeline/spec-template.md` is rewritten in that format.
- **Shell scripts (bash), no fallback to native PowerShell/cmd.** Git Bash/WSL documented as a mandatory dependency in `rules/`.
- **The Claude adapter (`harnesses/claude/skills/sdd/SKILL.md`) gets a new check**: before anything else, verify whether the project already has a defined SDD destination. If not, trigger `bootstrap/entrypoint.md` first; if so, go to `pipeline/entrypoint.md` as today.

## Open

- **`reasoning-chain.md` per-project override mechanism** — not yet designed (options raised: a file of its own in the SDD destination overriding the default, multiple presets, etc.). Decide when `bootstrap/entrypoint.md` is written in detail, since the wizard is probably the natural place to ask about this.
- **Exact content of `bootstrap/` presets (e.g.: GitHub options)** — not closed, left for when `bootstrap/entrypoint.md` is written.
- **How `bootstrap/init.sh` detects "project already has a defined SDD destination"** (to decide whether to run bootstrap or pipeline) — concrete mechanism (marker file? naming convention?) not yet designed.
- **Migration of `projects/solaria/.contexto/` to the new model** — deferred, treat as a separate task.

## Roadmap

1. Restructure directories: move `core/pipeline/*` into `pipeline/` (root), extract reflection into `reflection/` (`when-to-pause.md` from the current `reflection.md` + new `reasoning-chain.md` + `README.md`), remove `core/`.
2. Write `rules/writing-specs-obsidian.md` and rewrite `pipeline/spec-template.md` in Obsidian format (frontmatter, wikilinks, callouts).
3. Create `bootstrap/entrypoint.md` (wizard question flow) and `bootstrap/init.sh` (materialization), resolving the open items above while writing them.
4. Update `harnesses/claude/skills/sdd/SKILL.md` with the bootstrap-vs-pipeline check and the new paths (`pipeline/`, `reflection/`, `bootstrap/` instead of `core/pipeline/`).
5. Update `rules/structure.md` and `rules/adding-a-project.md` (or replace it with something equivalent, since `projects/` as a concept changes) to reflect the new architecture.

## General analysis checklist

- [x] Reuse checked — existing pipeline/entrypoint/reflection/spec-template were the base, not recreated from scratch.
- [x] Minimum scope — this design covers only the core SDD; distribution of skills/scripts/tools is left for the other core, decided separately.
- [ ] Applicable commit/PR rules — N/A in this document (no commit will be made; the user explicitly asked not to touch git this session).
- [x] No migration of live data (solaria) done without an explicit decision — deferred at the user's request.
