---
name: excalibur-skill-create
description: Use when something has been explained to the agent repeatedly and should become a reusable Excalibur framework skill. Creates skills that make the wizard and pipeline work, living in harnesses/<harness>/skills/ — not domain skills for whatever project you happen to be working on.
---

# Excalibur skill create

Turns a repeated pattern into a properly formed framework skill.

## Check the catalog before building anything

**First step, always:** check whether the public `skill-creator` skill is available in this environment.

If it is, **use it** — and bring the Excalibur-specific conventions below as context. Do not reimplement skill creation on top of it. Searching the catalog before creating something new is the standing pattern in the Claude ecosystem, and duplicating a working tool is a DRY violation at the tooling level.

Only if no such skill exists does it make sense to do the work here directly. In practice the gap is small: the public creator already knows how to write a `SKILL.md`; what it doesn't know is where Excalibur puts them and what Excalibur expects inside.

## Scope: framework skills, not project skills

This creates skills **of the framework** — the ones that make the wizard and the pipeline work, living in `harnesses/<harness>/skills/`.

It is **not** for creating domain skills for the target project ("how we deploy our billing service"). That knowledge belongs in the project's SDD destination, under `architecture/`, not in the framework.

## Excalibur's conventions

**Location.** `harnesses/claude/skills/<name>/SKILL.md`. Not in `lib/pipeline/` — that's for agents and process. Not at the repository root.

**Frontmatter.** `name` and `description` only. The description says *when to use it* and *when not to* — that's what the model matches against, so "Use when… Not for…" beats a summary of what the skill contains. Keep it short: agent and skill frontmatter are both in the size allowlist (`rules/heuristics/md-size-limits.yaml`).

**Body.** Point, don't duplicate. A skill that explains the whole process instead of linking to `lib/pipeline/entrypoint.md` has grown too big, and it will drift from the real process the first time that process changes.

**Language.** English. It's operational content, never translated (`rules/translation.md`).

**A persona is not a skill.** `guardrail` (`lib/personas/guardrail.md`) is plain prose an agent's YAML source references under `personas:`, baked into its built `.md` by the build step. If you're creating a disposition rather than a procedure, write it there instead of as a skill here.

## After creating one

1. If it's a task-type skill, add it to the table in `lib/pipeline/task-types.md` instead of writing a new body — the eleven existing ones share one.
2. Run `npx excalibur update` in a project using it, so the build copies it to the path the harness reads.
