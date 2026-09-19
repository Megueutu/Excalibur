# pipeline/agents/

The framework's internal agent catalog. One `.md` per agent: YAML frontmatter (`name`, `description`, `tools`, `skills`) plus a Markdown body. No separate `.yaml` file.

This is the single, fixed home for agents — they don't live under `harnesses/<harness>/`. If a harness needs a specific invocation tweak, that belongs in the harness adapter, not in a duplicated copy of the agent.

| Agent | Persona | Tools | Writes |
|---|---|---|---|
| [`orchestrator.md`](orchestrator.md) | guardrail | Read, Grep, Glob, Task | `proposal.md`, `tasks.yaml`, handoffs |
| [`spec-writer.md`](spec-writer.md) | guardrail | Read, Grep, Glob, Write, Edit | `spec.md` |
| [`idealizador.md`](idealizador.md) | guardrail | Read, Grep, Glob, Write, Edit | `ideas/`, project canvas |
| [`grill-me.md`](grill-me.md) | — | Read, Grep, Glob | nothing (interviews only) |
| [`review.md`](review.md) | guardrail | Read, Grep, Glob, Bash | `history.yaml`, `tasks.yaml` status, canvas |
| [`translator.md`](translator.md) | — | Read, Write, Glob | translations in place |

## Two guardrails, not one

**Persona** (`skills: [guardrail]`) sets the disposition — skeptical by default, questions before accepting, prefers safety over speed. It's a native Skill, so the harness preloads it; nothing concatenates text at build time.

**Tool allowlist** (`tools:`) is the physical limit. `review` has no `Write`/`Edit` at all — it cannot edit code even if it decides it should. That's the part a persona can't guarantee on its own.

`translator` and `grill-me` get no persona: neither makes a risky decision.

## Context isolation is deliberate

Every agent here runs as an isolated subagent. It doesn't inherit the main session, and it doesn't read `history.yaml` unless the handoff explicitly tells it to. The goal is that neither the user's back-and-forth nor the record of past attempts biases the work. This is why the handoff is deliberately small: it is the entire input.
