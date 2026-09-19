# harnesses/claude/

The Claude / Claude Code adapter — the only implemented harness (design doc section 11: 100% focus on Claude for now).

## skills/

| Skill | Invocation | What it does |
|---|---|---|
| `excalibur-init` | `/excalibur-init` | Runs onboarding. An explicit shortcut — automatic detection still works on its own |
| `sdd` | automatic | Triggers the pipeline when a request means implementing/fixing/changing something |
| `magic-book` | `/magic-book` | Loads the SDD context into a fresh session, cheaply and in a fixed order |
| `try-gh` | `/try-gh` | Checks whether `gh` is installed and authenticated; local checks before any web lookup |
| `excalibur-skill-create` | `/excalibur-skill-create` | Creates a framework skill — checks the public `skill-creator` first |
| `guardrail` | via `skills:` | The persona agents load; never invoked directly by a user |
| `feat`, `fix`, `refactor`, … | `/feat …` | One per Conventional Commits type — the explicit entry point to the pipeline |

Agents are **not** here — they live in [`../../pipeline/agents/`](../../pipeline/agents/). Only skills and harness-specific wiring belong in this folder.

## Where these end up

The CLI's build step resolves `.excalibur.custom/` over `.excalibur/` per file and writes the effective copy to the path Claude Code actually reads (`.claude/skills/`, `.claude/agents/`). Claude Code reads a fixed path and can't do that fallback itself, which is exactly why a build step exists.
