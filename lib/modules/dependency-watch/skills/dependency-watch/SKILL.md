---
name: dependency-watch
description: Use before a release or a push to check dependencies for known vulnerabilities and risky pins. `/dependency-watch`. Not for upgrading and not for a full security audit.
---

# /dependency-watch

A thin wrapper over the `lockwatch` subagent (`agents/lockwatch/agent.yaml`).

## What to do

1. Dispatch `lockwatch` on the project.
2. Surface its verdict first (`approved`, `attention` or `blocked`), then the table, then anything it could not check and why.
3. Change nothing. Upgrades are a separate task with their own review.
