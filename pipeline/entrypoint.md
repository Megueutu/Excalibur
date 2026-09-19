# Entrypoint — what to do when receiving an implementation request

Triggered by the SDD adapter of the harness in use (see `harnesses/<harness>/`) whenever the request is to implement/fix/change something in some repo — not for simple questions, reading code, or conceptual doubts.

## 1. Grillme (interview) — stop and ask, don't try to call it yourself

`grill-me` has `disable-model-invocation: true` — **it cannot be called via the Skill tool under any circumstance**, not even as a fallback attempt. Don't try `Skill({skill: "grill-me"})`, don't try to replicate the interview yourself pretending to be grill-me.

Mandatory step, before exploring the repo or touching any file:

1. Stop and explicitly ask the user to run `/grill-me` with the task.
2. Wait for the response — don't move on to code exploration, repo reading, or classification (step 2) until that happens.
3. Only after the user confirms the interview is done (or explicitly says to skip this step) does the pipeline continue.

This holds even if the task seems simple enough to "just proceed" — the decision to skip the interview is the user's, not an inference that "it's not needed".

## 2. Classifying the task

Ask (or infer with high confidence and confirm in one sentence) which of the three it is:

| Class | Criterion | What changes in the process |
|---|---|---|
| **Fix** | A specific bug, wrong behavior with an obvious fix, no open design decision | No formal spec. Just the final checklist (see [review-checklist.md](review-checklist.md)) before considering it done. |
| **Feature** | New functionality or behavior change with clear scope, but with real design decisions (where it fits in, how it integrates, what's out of scope) | Light spec in the project's SDD destination (embedded `.sdd/` or separate `<repo>-sdd/`, see [`wizard/entrypoint.md`](../wizard/entrypoint.md)), at `specs/<repo>/<task>/spec.md` (see [spec-template.md](spec-template.md)) before coding. |
| **Big feature** | Touches multiple modules/repos, has sequencing (phases), or real risk of rework if the wrong approach is chosen | Full spec with phased roadmap + per-phase analysis checklist. Consider splitting into per-phase specs if a single file gets too large. |

Ask directly if it's not clear which class applies — don't guess when genuinely in doubt (see [when-to-pause.md](../reflection/when-to-pause.md)).

## 3. Deep analysis — when

Explicitly ask whether the user wants a deep analysis before implementing (e.g.: mapping all call sites, reading multiple related repos, considering side effects on other services) whenever the task is **Feature** or **Big feature**. For **Fix**, only do this if the bug doesn't have an obvious cause up front.

## 4. Where files live

- **Task specs and analysis**: in the project's SDD destination (embedded `.sdd/` or separate `<repo>-sdd/`, see [`wizard/entrypoint.md`](../wizard/entrypoint.md)), at `specs/<repo>/<task-slug>/`. The goal is to leave no trace of AI-assisted planning in the history of the repo being worked on.
- **Process definition** (this pipeline): `pipeline/` — shared across all projects and harnesses. The reasoning chain used when producing specs lives in `reflection/`, separate from this pipeline.
- **Always-read rules**: pointed to by `guidelines.md` (if it exists) inside the project's SDD destination.

## 5. After finishing the implementation

Run the [review-checklist.md](review-checklist.md) before announcing the task as done — this applies to all three classes, only the depth changes.
