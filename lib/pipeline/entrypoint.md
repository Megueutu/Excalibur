# Entrypoint — what to do when an implementation request arrives

Triggered by the harness adapter (see `harnesses/<harness>/`) whenever the request is to implement, fix or change something — not for simple questions, reading code, or conceptual doubts.

If the project has no SDD destination yet, this is the wrong file: run onboarding first (`onboarding/flow.md`).

## The four layers

```
orchestrator  ->  write spec  ->  implement  ->  review
```

The orchestrator sits above the other three: it classifies the task, decides which layers actually run, and builds the handoff for each one. Everything below runs as an isolated subagent that sees its handoff and nothing else.

Not every layer runs on every task. A Fix usually goes orchestrator → implement → review, with no spec at all.

The concrete agents depend on the work: `scribe` writes the spec, `architect` owns a separate design when one is warranted, `implementer` executes planned changes, and `debugger` handles narrow reproducible defects. `researcher` can resolve a bounded unknown before design; `tester` can add focused verification before `review` performs the independent final check. Optional agents run only when their specialty is present in the handoff.

## 0. Read the session directives

`.excalibur-session.yaml` at the project root, every session, before anything else. It's the orchestrator's job (see `lib/agents/orchestrator/agent.yaml` for the full flag table), but any agent that changes behavior based on a flag reads it too. No file means no flags set — the normal case.

## 1. Entry point: how the request arrived

If the user invoked a task-type skill (`/feat`, `/fix`, `/refactor`, `/ci`…), the type already carries an effort hint — see [`task-types.md`](task-types.md). That's a strong hint, not a lock: it saves the orchestrator from inferring effort from free prose, and it gets revised when the real scope disagrees.

If the request arrived as plain prose, classify it from scratch in step 3.

## 2. Prober (the interview) — stop and ask, don't call it yourself

`prober` has `disable-model-invocation: true` — **it cannot be called through the Skill tool at all**. Don't try `Skill({skill: "prober"})`, and don't replicate the interview yourself pretending to be it.

Required before exploring the repo or touching any file:

1. Stop and explicitly ask the user to run `/prober` with the task.
2. Wait. Don't move on to exploration, reading the repo, or classification while waiting.
3. Continue only once the user confirms the interview is done, or explicitly says to skip it.

This holds even when the task looks simple enough to just get on with — skipping the interview is the user's call, not an inference that it wasn't needed.

**Exceptions**, all decided outside this file: the project's `autonomy` setting skips the interview on Fix tasks, the session has `skip-prober`, or the user says to skip it.

## 3. Classify the task

| Class | Criterion | What changes |
|---|---|---|
| **Fix** | A specific bug, wrong behavior with an obvious correction, no open design decision | No spec. Just the final checklist before it's done. |
| **Feature** | New functionality or a behavior change with clear scope, but real design decisions (where it goes, how it integrates, what's excluded) | Full task folder before coding — see [`spec-template.md`](spec-template.md). |
| **Big feature** | Touches multiple modules/repos, has sequencing (phases), or real risk of rework if the approach is wrong | Same, phased, with a per-phase definition of done. Consider splitting into per-phase specs if one file gets too big. |

Feature vs. Big feature follows the project's `task_class_criteria` setting: ask when it isn't obvious, or apply the objective criterion (more than one module/repo → Big feature).

Ask outright when the class isn't clear — don't guess through genuine doubt (see [`../reflection/when-to-pause.md`](../reflection/when-to-pause.md)).

## 4. Deep analysis — when

Ask explicitly whether the user wants deep analysis before implementing (mapping every call site, reading related repos, considering side effects elsewhere) on **Feature** and **Big feature**. On a **Fix**, only when the bug has no obvious cause.

## 5. Where the files live

- **The task's files** — the SDD destination chosen during onboarding: `specs/<repo>/<task-slug>/`, holding the five files from [`spec-template.md`](spec-template.md).
- **Project-wide knowledge** — `architecture/` (how things are built, stack, code standards, roadmap) and `ideas/` (thinking not yet formalized) in the same destination.
- **The process** — `lib/pipeline/`, shared across every project and harness. Never copied per project.
- **The framework's machinery** — the installed package (`node_modules/@easy-spec/excalibur/`) and, for overrides, the project's overrides folder (`custom_dir`).

Planning artifacts stay in the SDD destination, not in the repository being worked on — unless the project deliberately chose the embedded destination, which puts them at `.sdd/` inside the repo.

## 6. Implementing

`architect` owns `design.md` when dispatched. For smaller work without a separate architecture pass, `implementer` records the technical approach there. The file is written for execution, not as passive documentation.

Follow the global rules (`rules/global/`) and the project's stack rules (`rules/stacks/`). Under `strict-rules`, a violation fails the task instead of being noted.

Before writing a script or a mechanical check from scratch, check [`scripts/mapping.yaml`](../../scripts/mapping.yaml) — a short index of every existing script, by name and one-line purpose. Cheaper than reading all of `scripts/` to find out one already does what's needed.

## 7. After implementing

Run [`review-checklist.md`](review-checklist.md) before announcing the task as done. This applies to all three classes — only the depth changes.
