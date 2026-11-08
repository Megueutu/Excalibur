---
name: checkpoint
description: Use when a long task is about to be paused, handed over or cleared, to write its state into the task folder. `/checkpoint`. Not a transcript and not a replacement for the spec.
---

# /checkpoint

A long task should not be re-read from its first message every time it resumes. Write what a resumer needs and nothing else.

## What to do

1. Find the task folder in the SDD (`specs/<repo>/<task>/`). If there is none, say so and stop: a checkpoint belongs to a task.
2. Check the facts first: `git status`, `git log` since the spec's `linked_commit`, and `tasks.yaml`. Write only what those and the conversation both support.
3. Overwrite `checkpoint.md` in that folder with these sections, in this order, **under 40 lines in all**:
   - **Done**: what is finished and how it was verified.
   - **Decided**: each decision with its reason, one line each.
   - **Left**: the remaining steps, in order.
   - **Next action**: the single next thing to do, concrete enough to start without asking.
   - **Open questions**: what is blocked on a person.
   - **Touched**: the files that changed.

## Rules

- No transcript, no pasted output, no secrets or personal data.
- A decision without its reason is not worth keeping: either add the reason or leave it out.
- If the spec and the code disagree, say that in **Open questions**; do not settle it silently.
