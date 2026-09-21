---
name: excalibur-init
description: Use to run Excalibur's onboarding wizard for a project that has no SDD destination yet — no Excalibur config file, no .sdd/ and no sibling <repo>-sdd/. Decides where the SDD lives, asks the manifest questions (or applies their defaults), and materializes the destination. Not for a project that is already onboarded — use the `sdd` skill for those.
---

# Excalibur init (Claude adapter)

The Claude adapter for the onboarding wizard. It holds no methodology — just enough to trigger at the right moment and point at the shared flow.

This is an **explicit shortcut**, not a replacement: automatic detection still triggers onboarding on its own. `/excalibur-init` exists so onboarding can be forced or re-run deliberately.

## When to trigger

When the user asks to set up Excalibur for a project, or when the `sdd` skill finds no SDD destination and the user confirms they want onboarding. Never silently, as a side effect of an unrelated task.

## What to do

1. **Check for pre-collected answers.** If `.excalibur-answers.yaml` exists at the project root, the user already ran `npx excalibur init` in the terminal. Read it and skip the question-asking — the form collected them, so asking again wastes the user's time.

2. **Confirm the project isn't already onboarded.** See "Detection" in [`.excalibur/onboarding/flow.md`](../../../../onboarding/flow.md). If it is, stop and say so — don't run onboarding on top of an existing destination.

3. **Follow [`.excalibur/onboarding/flow.md`](../../../../onboarding/flow.md) exactly.** Git/GitHub setup, the manifest questions (or their defaults, if the user picks that), the post-manifest interpretation step, the copy list, `init.sh`, and translation if the language isn't English.

4. **Report what was created**, then hand off to the `sdd` skill for the project's first real task.

## Two things that are easy to get wrong

**The master question comes first.** "Customize the settings, or use the defaults?" If the user picks defaults, don't walk them through seventeen questions anyway — resolve each to its `default` and show the resolved set in one block.

**The interpretation step is not optional.** It runs on both paths, including when answers came from the terminal form. The form collects; it doesn't reconcile a combination of answers that don't sit well together, and it doesn't follow the `review_hint` attached to a chosen option.

## References

- The flow (shared, don't duplicate here): [`.excalibur/onboarding/flow.md`](../../../../onboarding/flow.md)
- The questions: [`.excalibur/onboarding/manifest.yaml`](../../../../onboarding/manifest.yaml)
- Translation: [`lib/agents/translator.yaml`](../../../../lib/agents/translator.yaml)
- Next step: [`../sdd/SKILL.md`](../sdd/SKILL.md)
