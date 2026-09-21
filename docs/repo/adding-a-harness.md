# Adding a new harness

Today only [`harnesses/claude/`](../../harnesses/claude/) exists and is functional. Codex and Cursor have no adapter — this file documents how to build one when the time comes, untested against either.

The design doc's section 11 is explicit that multi-harness is **not** this round's concern: skills, agents and scripts are designed for Claude without generalizing ahead of need. This file exists so that when generalization does happen, it doesn't start from zero.

## The adapter rule

A harness adapter **never** contains methodology — only:

1. When to trigger (that harness's native mechanism).
2. A pointer to `lib/pipeline/entrypoint.md` and to the project's own rules.

If the adapter starts explaining the process instead of pointing at it, it has grown too big — move the content back to `lib/pipeline/` if it's generic, or into the project's SDD destination if it's specific.

Use [`harnesses/claude/skills/sdd/SKILL.md`](../../harnesses/claude/skills/sdd/SKILL.md) as the reference for size and shape.

## What does not move

Agents live in [`lib/agents/`](../../lib/agents/), not under a harness. A new harness reuses the same agent definitions; if it needs a different invocation mechanism, that wiring belongs in the adapter, not in a copied agent file.

## Codex

- Native format: `AGENTS.md` at the root of the repo being worked on (Codex reads it hierarchically).
- Excalibur only ever **reads** an `AGENTS.md` that already exists — it is an external market convention (Cursor and others use the same name), not a file Excalibur owns or creates. An adapter would have to respect that.
- Content: same trigger and same pointers as the Claude adapter, rewritten as the direct instruction format Codex expects (no skill frontmatter).

## Cursor

- Native format: `.cursor/rules/*.mdc` with frontmatter (`description`, `globs`, `alwaysApply`).
- `harnesses/cursor/rules/sdd.mdc` — same trigger and pointers, in `.mdc` frontmatter.
- Cursor Rules has no direct equivalent to an on-demand Skill invocation — check whether `alwaysApply: true` or a glob trigger is the better approximation before settling.

## Also needed for any new harness

The CLI's build step writes the effective (override-resolved) files to the fixed path the harness reads. For Claude that's `.claude/agents/` and `.claude/skills/`. A new harness means adding its target paths to `packages/cli/core/paths.js` — that's the only place in the CLI that should know them.

## When an adapter is done

Update this file: drop the "untested" caveat and point at the new adapter as a reference, the way `harnesses/claude/` is today.
