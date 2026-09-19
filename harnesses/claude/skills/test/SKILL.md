---
name: test
description: Use to start work on adding or fixing tests in a project onboarded with Excalibur — `/test <what you want>`. It is the explicit entry point to the pipeline, carrying the effort expected of a `test` task so the orchestrator doesn't have to infer it from prose. Not for a task of a different type; pick the skill matching what the work actually is.
---

# /test

Entry point to the Excalibur pipeline for a **`test`** task.

## Effort hint

> Light — normally no plan needed.

The orchestrator receives this as a starting expectation, not a rule.

## What to do

1. Read [`pipeline/task-types.md`](../../../../pipeline/task-types.md) — the shared body behind every task-type skill. It holds the full effort table and how hints interact with classification.
2. Follow [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) from step 1, passing `test` as the declared type.
3. The orchestrator confirms or adjusts the classification against the real scope. If it disagrees with the hint, say so out loud — a `/test` that turns out to be something else is normal, not a failure.

## Why this is such a small file

Eleven task types sharing one body, instead of eleven copies of the same instructions that drift apart the first time the process changes. The type name and its effort hint are the only things that genuinely differ.
