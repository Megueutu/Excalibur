# Template — a task folder

A task lives in `specs/<repo>/<task-slug>/` in the SDD destination, and holds **five files**. Splitting by nature of content beats one large file: each one has a different author, a different reader, and a different lifetime.

| File | Format | Written by | What it holds |
|---|---|---|---|
| `proposal.md` | Markdown | orchestrator | Why the task exists, what changes |
| `spec.md` | Markdown | spec-writer | The requirements themselves |
| `design.md` | Markdown | implementer | Technical approach, written for agents to execute |
| `tasks.yaml` | YAML | orchestrator | The granular checklist |
| `history.yaml` | YAML | review (via script) | Changelog of what actually happened |

Only `tasks.yaml` and `history.yaml` are YAML. The other three are genuinely prose and reasoning, and YAML handles that badly — the same logic that keeps agent definitions in Markdown with a frontmatter header.

Don't fill in sections that don't apply. This is a reference structure, not a form to complete field by field.

## `proposal.md`

```markdown
---
status: in-progress    # in-progress | done | paused
project: <project-name>
task: <task-slug>
class: feature         # fix | feature | big-feature
created: YYYY-MM-DD
---

# <short task name>

## Why this exists
What prompted it, what exists today, what is being asked.

## What changes
The shape of the change in a few lines — not the implementation.

## Explicitly out of scope
What this task is deliberately not doing. Usually the most valuable section.
```

## `spec.md`

```markdown
---
spec_id: <task-slug>
status: draft          # draft | in_progress | blocked | done | obsolete
last_updated: YYYY-MM-DD
linked_commit: <sha>
linked_release: <tag>  # optional — omit until a release actually ships it
depends_on: []          # spec_ids this one assumes are still true
freshness_check: pending  # ok | stale | pending
---

# <short task name>

## Context
What exists today, what came out of the interview, what is already confirmed.

## Closed decisions
Confirmed with the user, not to be reopened. Confirmed — not assumed.

> [!note] Decision
> Reuse the existing auth middleware instead of adding a second one.

## Open
Questions that still have no answer. Use reflection/when-to-pause.md to decide
whether to pause or proceed.

> [!warning] Open
> Whether the rate limit applies per user or per token.

## Requirements
What has to be true when this is done. This section has no size limit — an API
spec with documented payloads legitimately runs long.

## General analysis checklist
- [ ] Reuse checked before writing new code
- [ ] Minimum scope — nothing implemented beyond what was asked
- [ ] Applicable commit/PR rules identified
- [ ] Is this a core repo? If so, minimal change confirmed
- [ ] No code comments added without an explicit request
```

## `design.md`

```markdown
# Design — <short task name>

## Approach
The chosen approach and, briefly, why the discarded ones were discarded.

## Sequence
What happens in what order, at the level an agent can execute from.

## Affected files
Which files/modules get touched, and what each change is for.

## Testing decision
Whether this task gets tests, per the project's testing policy — recorded here
so review checks against a stated intent instead of guessing.

## Risks
What could go wrong and what would signal it.
```

## `tasks.yaml`

```yaml
version: 1
# Numbering follows rules/tasks-ordering.yaml — a fixed heuristic, not a
# per-task judgment call. Hierarchical when steps depend on each other,
# flat when they don't.
ordered: true
tasks:
  - id: "1.1"
    description: "Add the rate-limit column to the migration"
    status: pending        # pending | done
  - id: "1.2"
    description: "Apply the limit in the middleware"
    depends_on: ["1.1"]
    status: pending
```

Independent items instead drop `depends_on` and use flat ids (`a`, `b`, `c` or `1`, `2`, `3`) with `ordered: false` — numbering that implies a sequence that doesn't exist is misinformation.

## `history.yaml`

Never written by hand — `wizard/scripts/record-history.sh` owns the format. A changelog per task, not a granular event log, and **not read by any agent** unless a handoff or the user explicitly asks for it.

```yaml
version: 1
entries:
  - date: YYYY-MM-DD
    what: 'what changed'
    why: 'why it changed'
    checklist: pass
    agent: 'review'
```

## Obsidian

Frontmatter, wikilinks and callouts follow [`../rules/writing-md-obsidian.md`](../rules/writing-md-obsidian.md). `status` and `class` are the fields worth filtering on later — keep them current, not just correct at creation.

`spec.md`'s own frontmatter carries a second set of fields — `spec_id`, `status`, `last_updated`, `linked_commit`, `linked_release`, `depends_on`, `freshness_check` — that exist for anti-spec-drift, not for Obsidian filtering. What each one means and who writes it is documented in [`../rules/writing-md-obsidian.md`](../rules/writing-md-obsidian.md#anti-spec-drift-frontmatter).
