# Token budget — spending attention where it earns something back

This is about the general shape of context and token spend across a session, not the mechanics of Anthropic's prompt-caching feature — see `rules/prompt-cache.md` for that.

## Measure before optimizing

Don't guess which part of a session is expensive; look. `/usage` and the status line show real spend without costing anything extra to check. Optimizing a part of the pipeline that was never the expensive one is effort spent on the wrong problem — worse, it's effort that feels like progress while the actual cost sits untouched somewhere else.

## Clear or compact between unrelated tasks

A session that drifts from one task to an unrelated one while keeping the whole history is carrying context that no longer helps and actively competes for attention with what's current.

- When the next task shares nothing with what came before, clear context rather than carry it forward.
- When intent has to survive the transition — a decision made earlier still matters — compact it into an LLM summary instead of re-reading the full history. A summary that preserves *why* costs a fraction of the transcript it replaces.

## Checkpoint long execution histories

A long-running task shouldn't be re-read from the beginning every time it's resumed. Checkpoint it into compact state — what's done, what's decided, what's left — the same way `tasks.yaml` and `history.yaml` let `review` know a task's status without re-deriving it from every prior message. Re-reading everything to reconstruct what a checkpoint could have said directly is the same false economy as skipping the checkpoint in the first place.

## Keep task scope small

A single task that tries to both find problems and judge them pays full attention cost on every part, even the part a cheap deterministic pass would have handled for free. Splitting scan from judgment is already how two parts of this framework work:

- `docs-update` (`harnesses/claude/skills/docs-update/SKILL.md`) runs `lib/scripts/scan-spec-freshness.sh` — free, deterministic — before ever dispatching `clerk` to spend judgment only on what the sweep actually flagged.
- `scenthound-scan` (`harnesses/claude/skills/scenthound-scan/SKILL.md`) is itself the cheap, narrowly-scoped pass — a pre-push sniff test, not a full audit — precisely so most runs end at `approved` without needing more.

The same split applies to any new task: separate the mechanical part from the part that genuinely needs judgment, and only pay for the second where the first didn't already answer the question.

## Route by complexity

Not every decision needs the same weight behind it. A low-risk, well-defined edit gets the cheap mechanism — a script, a fixed checklist, a narrow-scoped agent. Architecture calls, ambiguous requirements, and anything security-adjacent get the expensive judgment pass, because that's where getting it wrong is expensive in a way tokens never are.

Routing everything through the expensive path "to be safe" isn't caution — it's spending the same budget on a formatting fix that a real design decision needed, which means the design decision effectively got less attention than it should have.

## Cache repeated results

Work already computed once shouldn't be recomputed on faith that it changed. Reuse a prior scan, a prior check-gh result, a prior stack detection, unless something that would invalidate it actually happened. This is the same instinct behind `rules/prompt-cache.md`'s stable-prefix ordering, just applied to results instead of prompt bytes.

## Watch for false economy

The cheapest option per call is not the cheapest option overall if it causes rework. A shallow pass that misses something real costs far more once the miss surfaces downstream — a bug shipped, a spec left silently stale, a security finding caught in production instead of at `scenthound-scan`. Measure cost by the accepted outcome, not by what the single call billed for. A more expensive pass that gets it right the first time is often the actual saving.
