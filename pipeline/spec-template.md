# Template — task spec

Copy this structure when creating the spec for a **Feature** or **Big feature** task (see criteria in [entrypoint.md](entrypoint.md)). Follows the conventions in [rules/writing-specs-obsidian.md](../rules/writing-specs-obsidian.md) — frontmatter, wikilinks, callouts. Don't fill in sections that don't apply — it's not a mandatory field-by-field form, it's a reference structure.

```markdown
---
status: in-progress
project: <project-name>
task: <task-slug>
class: feature
created: YYYY-MM-DD
---

# <short task name>

## Context
What motivated this, what exists today, what's being asked — summary of what came out of the interview (grillme) and the "Context" step of [[reasoning-chain]].

> [!note] Decision
> List of what was confirmed with the user and doesn't need to be reopened (output of the "Decision" step of [[reasoning-chain]]).

> [!warning] Open
> Questions/decisions without an answer yet — use [[when-to-pause]] to decide whether to pause or continue.

## Roadmap
1. Step 1 — what, where (file/module), "done" criteria.
2. Step 2 — ...

(Big feature: group steps into phases, each phase with its own "done" checklist.)

## General analysis checklist
- [ ] Reuse checked before creating new code
- [ ] Minimum scope — nothing implemented beyond what was asked
- [ ] Applicable commit/PR rules identified
- [ ] No code comments without an explicit request
```
