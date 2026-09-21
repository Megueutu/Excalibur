# Testing policy — decided per task

- Whether a task needs tests is decided **during the task**, not by a standing rule.
- The decision is made once, early — when the task is classified — and written into `design.md`, so the review agent checks against a stated intent instead of guessing.
- The final review checklist verifies that the decision was recorded and honored, not that a test exists.
- When the decision isn't obvious, follow the project's existing pattern: if the code being touched already has tests around it, match that; if it has none, don't introduce a test framework as a side effect of an unrelated task.
