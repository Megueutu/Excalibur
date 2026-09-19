---
name: sdd-init
description: Use once, before any implementation task, when a project has no SDD destination configured yet (no `.sdd/` at its root and no sibling `<repo>-sdd/`). Runs the onboarding wizard that decides where the project's SDD lives, asks a fixed set of setup questions, and materializes the destination by copying pre-written files — never generating new content except a one-time translation step. Not for projects that already have an SDD destination — use the `sdd` skill for those.
---

# SDD Init (Claude adapter)

This file is the Claude adapter for Excalibur's onboarding wizard. It doesn't contain the methodology itself — just enough to trigger at the right time and point to the shared flow.

## When to trigger

Only when the user explicitly asks to set up SDD for a project, or when the `sdd` skill detects the project has no SDD destination yet and the user confirms they want to proceed with onboarding. Never run silently as a side effect of an unrelated task.

## What to do

1. Confirm the project has no SDD destination yet (see "Detection" in [`wizard/entrypoint.md`](../../../../wizard/entrypoint.md#detection-for-harness-adapters)). If it already has one, stop and tell the user — don't re-run onboarding on top of an existing destination.
2. Follow [`wizard/entrypoint.md`](../../../../wizard/entrypoint.md) exactly: read `wizard/manifest.yaml`, ask each question in order, resolve the answers into a copy list, call `wizard/init.sh`, and invoke the `translator` subagent if the resolved language isn't English.
3. Report what was created and hand off to the `sdd` skill for the project's first real task.

## References

- Methodology (shared, don't edit here): [`wizard/entrypoint.md`](../../../../wizard/entrypoint.md), [`wizard/manifest.yaml`](../../../../wizard/manifest.yaml)
- Translation: [`harnesses/claude/agents/translator.md`](../../agents/translator.md)
- Next step after onboarding: [`harnesses/claude/skills/sdd/SKILL.md`](../sdd/SKILL.md)
