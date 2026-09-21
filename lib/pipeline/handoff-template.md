# Template — handoff

Written by the orchestrator, one per dispatched agent. Short `.md` with YAML frontmatter, same shape as an agent definition.

Copy this structure into `specs/<repo>/<task>/handoffs/YYYY-MM-DD-<agent>.md`.

```markdown
---
agent: spec-writer
task: <task-slug>
spec: "[[<task-slug>-spec]]"
architecture:
  - "[[stack]]"
  - "[[auth-flow]]"
read_history: false
---

## Scope

One paragraph: what this agent is being asked to produce, and what is explicitly outside it.

## What you need to know

Only what isn't already in the linked files. If it's in the spec, don't restate it here —
the point is to link, not to copy.

## Definition of done

What has to be true for this handoff to be satisfied.
```

## Why it's this small

The receiving agent runs in an isolated context. It does **not** inherit the main session, it cannot see what the user said, and it does not read `history.yaml`. This file is its entire input.

That cuts both ways:

- **Leave something out** and the agent simply won't know it. It can't ask the session, because it can't see the session.
- **Put too much in** — the whole project, the full history, every architecture file — and you've paid for context that biases the agent toward what has already been tried. That bias is exactly what the isolation exists to prevent.

The handoff is a size limit that matters, and it's in the allowlist in `rules/heuristics/md-size-limits.yaml` for that reason.

## Fields

| Field | Meaning |
|---|---|
| `agent` | Which agent this is for |
| `task` | The task slug, matching the folder name |
| `spec` | Wikilink to the task's spec |
| `architecture` | Only the `architecture/` notes that are genuinely relevant — not all of them |
| `read_history` | `false` by default. `true` only when the task genuinely turns on what was tried before, or the session sets `read-history: always` |

## Ordering, for cache

Keep the stable-first order from `rules/prompt-cache.md` when assembling the actual context: global rules → stack rules → `architecture/` → this handoff and the task spec. The task-specific part goes last and stays outside the cached prefix, because it's what changes on every call.
