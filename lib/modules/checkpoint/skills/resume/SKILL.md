---
name: resume
description: Use at the start of a session that continues a task, to rebuild the state from its checkpoint instead of from the history. `/resume`. Not for starting a new task.
---

# /resume

Rebuild where a task stands from the page it left, and check that page against the code before trusting it.

## What to do

1. Read `checkpoint.md` in the task folder, then `tasks.yaml` and the spec's status. Do not read older history unless a section says to.
2. Verify the claims: `git status` and `git log` since the checkpoint's date. If the code moved on, say how.
3. Say, in a few lines: what is done, what is next, and what changed since the checkpoint.
4. Start the **Next action**. If the checkpoint is missing or contradicts the code, say so and ask before going on.

## Rules

- A checkpoint is a claim, not proof. A step marked done that the code does not show is not done.
- Do not rewrite the checkpoint while resuming; `/checkpoint` does that at the next pause.
