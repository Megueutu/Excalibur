# Task types — the explicit entry point to the pipeline

Shared body behind the task-type skills (`/feat`, `/fix`, `/refactor`, `/perf`, `/test`, `/docs`, `/style`, `/build`, `/ci`, `/chore`, `/revert`). Each skill is a thin file that names its type and points here.

## Why these exist

Without them, the orchestrator has to infer from free prose whether a request is a quick fix or a multi-phase feature. The type is information the user already has, and typing `/fix` instead of describing the size of the job costs them nothing.

The vocabulary is Conventional Commits, deliberately — it's already known, it already maps to the project's commit convention, and inventing a parallel naming scheme would mean maintaining two.

## Effort hints

| Type | Effort hint for the orchestrator |
|---|---|
| `/feat` | Variable — Feature or Big feature depending on scope. Usually needs a full plan/spec |
| `/fix` | Light — normally **no plan needed**; matches the existing Fix classification |
| `/refactor` | Medium — no external behavior change, but risky enough to deserve a `design.md` explaining why, even with no new requirement |
| `/perf` | Medium, like refactor — usually needs a `design.md` justifying the approach |
| `/test` | Light — normally no plan needed |
| `/docs` | Light — no plan |
| `/style` | Very light — no plan, minimal effort; formatting only, no logic change |
| `/build` | Light, like `/ci` |
| `/ci` | Light — no plan, usually a config change |
| `/chore` | Light — no plan |
| `/revert` | Very light — mechanical, almost no decision-making involved |

## Hints, not locks

This does **not** replace the Fix / Feature / Big feature classification in [`entrypoint.md`](entrypoint.md) — it **feeds** it. The skill arrives with an expected effort; the orchestrator confirms or adjusts it against what the scope turns out to be.

A `/fix` that turns out to touch four modules gets reclassified as a Big feature, and the orchestrator says so. A `/feat` that turns out to be a one-line correction gets treated as a Fix. Neither is a failure of the hint: pre-classifying most tasks correctly and correcting the rest is cheaper than classifying every one from scratch.

## Adding a type

The eleven above are the full Conventional Commits set. If a project uses a type beyond it, add a skill file naming the type and pointing here, and add a row to the table. Nothing else needs to change.
