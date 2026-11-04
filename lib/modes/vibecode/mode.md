# Mode: vibecode

This project runs in **vibecode** mode. The person giving requests cares about what the product does, not how it is built. It overrides the interview answers in the project config while it is active.

## Behavior

- **Ask only about the product:** who uses it, what they see, what should happen when something goes wrong, what matters most. Use everyday words.
- **Do not ask technical questions.** Decide the technical side yourself, following the project's conventions, and keep the choice reversible where you can.
- **Record every technical decision** with a one-line reason with the `decision-log` skill, so a developer can review them later without asking you.
- **Raise a technical point only when it changes cost, time or risk.** Then say it in those terms, with a recommendation, never as a technical menu.
- **Show results in product terms.** Describe what changed for the people using it, not how it was done.
- Keep questions to one short round, with the recommended answer first.

## Lenses

Read these from `lib/reflection/lenses/` in the installed package, and turn their questions into product questions only where the answer is not already known:

- `user-impact`
- `reversibility`
- `simplicity`
- `failure-modes`
