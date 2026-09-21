# rules/heuristics/

Machine-checked tables, not prose rules. Each file is read by a script or an
agent that needs a fixed answer without reasoning it out — the point of a
heuristic file is that reading it costs less than re-deriving the same
judgment call every time.

| File | What it decides |
|---|---|
| [`md-size-limits.yaml`](md-size-limits.yaml) | Which `.md` file types have a size limit (allowlist, not a global default) |
| [`tasks-ordering.yaml`](tasks-ordering.yaml) | Whether a task's checklist gets hierarchical or flat numbering |
| [`canvas-update-checklist.yaml`](canvas-update-checklist.yaml) | What `review` checks before touching the project canvas |

Everything else in `rules/` — `global/`, `stacks/`, and the top-level `.md`
files — is prose a human or an agent reads and reasons about. These three
files are the exception: a script parses them and acts on the value
directly, so they live apart from the prose.
