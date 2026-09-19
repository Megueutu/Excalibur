# pipeline/

The implementation process: what happens, in what order, for every task after onboarding. Harness-agnostic and project-agnostic — nothing here names a specific project, org or repo.

| File | What it is |
|---|---|
| [`entrypoint.md`](entrypoint.md) | What to do when an implementation request arrives — the four layers |
| [`task-types.md`](task-types.md) | Shared body behind the `/feat`, `/fix`, `/refactor`… skills, with the effort hint per type |
| [`spec-template.md`](spec-template.md) | The five files that make up a task folder |
| [`review-checklist.md`](review-checklist.md) | Mandatory execution step before a task can be called done |
| [`handoff-template.md`](handoff-template.md) | The only channel of information a subagent receives |
| [`agents/`](agents/) | The internal agent catalog — see [`agents/README.md`](agents/README.md) |

## The four layers

```
orchestrator  ->  write spec  ->  implement  ->  review
```

The orchestrator decides who does what and builds each handoff. Everything below it runs as an isolated subagent: it gets the handoff and nothing else — not the user's session, not the execution history. That isolation is the point, not a side effect (see [`agents/README.md`](agents/README.md)).

How much of this actually runs depends on the task class (Fix / Feature / Big feature) — a Fix normally skips the spec layer entirely.
