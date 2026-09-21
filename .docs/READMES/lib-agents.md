# lib/agents/

The framework's internal agent catalog. One `.yaml` source per agent (structured data with name, description, tools, skills, and Markdown body), built into `.claude/agents/<name>.md` by the build system (`excalibur/src/lib/build.js`). The `.md` output is what Claude Code actually reads and runs; this directory holds the source.

This is the single, fixed home for agents — they don't live under `harnesses/<harness>/`. If a harness needs a specific invocation tweak, that belongs in the harness adapter, not in a duplicated copy of the agent.

| Agent | Persona | Tools | Writes |
|---|---|---|---|
| `orchestrator.yaml` | guardrail | Read, Grep, Glob, Task | `proposal.md`, `tasks.yaml`, handoffs |
| `spec-writer.yaml` | guardrail | Read, Grep, Glob, Write, Edit | `spec.md` |
| `idealizador.yaml` | guardrail | Read, Grep, Glob, Write, Edit | `ideas/`, project canvas |
| `grill-me.yaml` | — | Read, Grep, Glob | nothing (interviews only) |
| `review.yaml` | guardrail | Read, Grep, Glob, Bash | `history.yaml`, `tasks.yaml` status, canvas |
| `translator.yaml` | — | Read, Write, Glob | translations in place |
| `docs-updater.yaml` | guardrail | Read, Grep, Bash, Edit | `freshness_check` (drift reporting only) |
| `scenthound.yaml` | guardrail | Read, Grep, Bash | nothing (security audit only) |

## Two guardrails, not one

**Persona** (`skills: [guardrail]`) sets the disposition — skeptical by default, questions before accepting, prefers safety over speed. It's a native Skill, so the harness preloads it; nothing concatenates text at build time.

**Tool allowlist** (`tools:`) is the physical limit. `review` has no `Write`/`Edit` at all — it cannot edit code even if it decides it should. That's the part a persona can't guarantee on its own.

`translator` and `grill-me` get no persona: neither makes a risky decision.

## Context isolation is deliberate

Every agent here runs as an isolated subagent. It doesn't inherit the main session, and it doesn't read `history.yaml` unless the handoff explicitly tells it to. The goal is that neither the user's back-and-forth nor the record of past attempts biases the work. This is why the handoff is deliberately small: it is the entire input.
