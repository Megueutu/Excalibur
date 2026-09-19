# Standard reasoning chain — spec production

Sequence the agent follows when producing any `spec.md` (**Feature** or **Big feature** tasks, see [pipeline/entrypoint.md](../pipeline/entrypoint.md)). This is Excalibur's generated default — a project can override it with its own version (see "Per-project override" below).

## The four steps

1. **Context** — what exists today, what motivated the request, what has already been confirmed with the user (grillme, if run). Without this written down, don't move to the next step.
2. **Hypotheses** — at least two plausible ways to solve it, even if one seems obvious. Note the trade-off of each before choosing.
3. **Validation** — check each hypothesis against what already exists in the repo/project (reuse, already-established pattern, see [when-to-pause.md](when-to-pause.md) for when this isn't clear enough to decide alone). Discard hypotheses that require reinventing something that already exists.
4. **Decision** — pick a hypothesis, record why the others were discarded. This decision becomes the "Closed decisions" section of the spec (see [pipeline/spec-template.md](../pipeline/spec-template.md)).

## Per-project override

If the project's SDD destination (embedded or separate repo — see [wizard/entrypoint.md](../wizard/entrypoint.md)) has its own `reflection/reasoning-chain.md`, it takes precedence over this one. If it doesn't, this is the default used.

## When it doesn't apply

Tasks classified as **Fix** don't go through this chain — only the standard `pipeline/entrypoint.md` process. This chain is for design decisions (Feature/Big feature), not for specific fixes.
