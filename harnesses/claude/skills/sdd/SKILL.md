---
name: sdd
description: Use before implementing, fixing, or changing anything in any project tracked by this Excalibur SDD setup — before writing code, opening a branch, or touching files as part of a task. Not for read-only questions, explanations, or exploring code with no change intended. Runs the grillme interview, classifies the task (fix/feature/big feature), and decides whether a spec is needed — keeping all planning out of the repo being worked on.
---

# SDD (Claude adapter)

This file is the Claude adapter for this Excalibur's SDD process. It doesn't contain the methodology itself — just enough to trigger at the right time and point to the shared content.

## When to trigger

Whenever the request is to implement, fix, or change something in some repo/project — not for simple questions, reading code, or conceptual doubts.

## What to do

1. Identify the project's repo being worked on. Check whether it already has an SDD destination (see "Detection" in [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md#detection-for-harness-adapters)):
   - No destination yet → tell the user this project needs onboarding first, via the `sdd-init` skill. Don't skip to implementation before that.
   - Already has a destination → go straight to step 2.
2. Read, in this order:
   - [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) — full process (grillme, classification, where spec/analysis live).
   - [`reflection/reasoning-chain.md`](../../../../reflection/reasoning-chain.md) — reasoning chain to follow when writing the spec.
   - `guidelines.md` (or equivalent, if it exists) inside the project's SDD destination (embedded `.sdd/` or separate `<repo>-sdd/`).
3. Follow the process described in [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) strictly, including stopping to ask for `/grill-me` before any code exploration.

## References

- Methodology (shared, don't edit here): [`pipeline/`](../../../../pipeline/) and [`reflection/`](../../../../reflection/)
- New project onboarding: [`bootstrap/`](../../../../bootstrap/)
- Current project's rules: inside its SDD destination (`.sdd/` or `<repo>-sdd/`)
- How this repo is organized: [`rules/structure.md`](../../../../rules/structure.md)
