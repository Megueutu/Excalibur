# Mode: deep

This project runs in **deep** mode. It overrides the interview, spec and review answers in the project config while it is active.

## Behavior

- Every task gets a spec, whatever its class, and the interview before it is mandatory.
- Review is strict: run the strict form of the review checklist and report every gap.
- Ask the hard, low-level questions. Name the invariants, limits, failure paths and trade-offs, and say which ones the answer depends on.
- Prefer a short list of precise questions over a long list of vague ones, and ask them in one round.
- Never decide a consequential, hard-to-undo point alone. State the options, the cost of each and a recommendation.

## Lenses

Before the spec, read the lenses that fit the task from `lib/reflection/lenses/` in the installed package. Read only those, not the whole folder:

- `reversibility` — shared state, history, published results
- `failure-modes` — anything that can be slow, absent or wrong
- `data-lifecycle` — information created, moved, changed or removed
- `boundaries` — seams between modules, teams, producers and consumers
- `trust` — outside input, identity, permissions, secrets
- `user-impact` — what people see, including when it fails
- `simplicity` — plans that keep growing
- `observability` — work that runs unattended

Turn each lens's questions into questions for the user only where the answer is not already in the project.
