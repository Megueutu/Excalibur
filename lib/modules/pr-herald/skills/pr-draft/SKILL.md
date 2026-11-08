---
name: pr-draft
description: Use when a branch is ready for review, to get a pull request description drafted from its diff, spec and history. `/pr-draft`. Not for opening the pull request.
---

# /pr-draft

A thin wrapper over the `herald` subagent (`agents/herald/agent.yaml`).

## What to do

1. Dispatch `herald` against the current branch. Say which base to compare with if the person named one.
2. Show the draft as text, ready to paste, with anything unverified marked as such.
3. Open nothing and push nothing; if the person wants the pull request created, that is a separate, explicit step.
