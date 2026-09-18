# Adding a new harness

Today only [`harnesses/claude/`](../harnesses/claude/) exists and is functional. Codex and Cursor don't have an adapter yet — this file documents how to build one when the time comes, though untested on either so far.

## General adapter rule

A harness adapter **never** contains methodology — only:
1. When to trigger (that harness's native trigger).
2. A pointer to `pipeline/entrypoint.md`, `reflection/`, and (if the project doesn't yet have an SDD destination) to `bootstrap/entrypoint.md`.

If the adapter starts explaining the process instead of pointing to it, it has grown too large — move the content back to `pipeline/`/`reflection/` if it's generic, or to that project's SDD destination (embedded `.sdd/` or separate `<repo>-sdd/`, see [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md)) if it's specific.

Use [`harnesses/claude/skills/sdd/SKILL.md`](../harnesses/claude/skills/sdd/SKILL.md) as the size/format reference when building the next ones.

## Codex

- Native format: `AGENTS.md` at the root of the repo being worked on (Codex reads it hierarchically).
- Since Excalibur isn't the repo being worked on, the adapter's `AGENTS.md` (`harnesses/codex/AGENTS.md`) serves as a model to copy/reference into the real project's repo, or to paste into that repo's `AGENTS.md` — decide the exact mechanics (manual copy vs. reference) at implementation time, don't assume now.
- Content: same trigger and same pointers as the Claude adapter, adapted to the direct-instruction format Codex expects (no skill frontmatter).

## Cursor

- Native format: `.cursor/rules/*.mdc` with frontmatter (`description`, `globs`, `alwaysApply`).
- `harnesses/cursor/rules/sdd.mdc` — same trigger/pointers, frontmatter in `.mdc` format.
- Cursor Rules has no direct equivalent to an on-demand "Skill tool" — check whether `alwaysApply: true` or a glob-based trigger is the best approximation before finalizing.

## When finishing a new adapter

Update this file, removing the "untested" caveat and pointing to the adapter as a reference, the way `harnesses/claude/` already is today.
