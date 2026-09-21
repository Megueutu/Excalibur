---
name: sdd
description: Use before implementing, fixing, or changing anything in a project onboarded with Excalibur — before writing code, opening a branch, or touching files as part of a task. Not for read-only questions, explanations, or exploring code with no change intended. Classifies the task, runs the pipeline's layers, and keeps planning where the project decided it should live.
---

# SDD (Claude adapter)

The Claude adapter for Excalibur's implementation pipeline. It holds no methodology — just enough to trigger at the right moment and point at the shared process.

## When to trigger

Whenever the request is to implement, fix or change something. Not for simple questions, reading code, or conceptual doubts.

If the user came in through a task-type skill (`/feat`, `/fix`, `/refactor`…), that skill already routed here with an effort hint attached.

## What to do

1. **Confirm the project is onboarded.** Is there an `Excalibur` config file at the root? If not, check `.sdd/` and a sibling `<repo>-sdd/` (see "Detection" in [`.excalibur/onboarding/flow.md`](../../../../.excalibur/onboarding/flow.md)). If none exist, stop and offer `/excalibur-init` — don't improvise a structure.

2. **Read, in this order:**
   - `.excalibur-session.yaml`, if present — the session directives change what runs.
   - `lib/pipeline/entrypoint.md` — the full process.
   - The project's own rules, from the destination named in the `Excalibur` config.

   That order is also the prompt-cache order (`rules/prompt-cache.md`): stable content first, task-specific content last.

3. **Follow `lib/pipeline/entrypoint.md` strictly**, including stopping to ask for `/grill-me` before exploring any code.

## The one thing not to improvise

`grill-me` has `disable-model-invocation: true`. It cannot be called through the Skill tool — don't try, and don't run the interview yourself while claiming it's the grill-me step. Stop, ask the user to run it, and wait.

The exceptions are decided elsewhere: the project's `autonomy` setting, a `skip-grillme` session flag, or the user saying to skip it.

## References

- The process (shared, don't edit here): [`lib/pipeline/entrypoint.md`](../../../../lib/pipeline/entrypoint.md)
- Task types and their effort hints: [`lib/pipeline/task-types.md`](../../../../lib/pipeline/task-types.md)
- The agent catalog: [`lib/agents/`](../../../../lib/agents/)
- Onboarding, if the project isn't set up yet: [`../excalibur-init/SKILL.md`](../excalibur-init/SKILL.md)
