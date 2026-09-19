# DRY — Don't Repeat Yourself

Every piece of knowledge should have one authoritative representation. The emphasis is on *knowledge*, not on text that happens to look similar.

## In practice

- **A rule that lives in two places will diverge.** Not might — will. One of them gets updated and the other doesn't, and afterwards nobody knows which is right.
- **Duplication in documentation is as costly as in code.** Two files explaining the same convention differently is worse than one file explaining it once and another linking to it.
- **Copy-paste is a decision, not a shortcut.** Either the two places share knowledge, and it should be extracted, or they don't, and the resemblance is a coincidence that will stop being true.

## The part that gets misapplied

Two pieces of code can look identical and encode entirely different knowledge. Extracting them into a shared helper couples two things that only happened to agree, and the next change to one of them either breaks the other or grows a flag parameter.

The question is never "do these look the same?" — it's **"if one changes, must the other change too?"** Yes means they're the same knowledge; extract. No means leave them alone.

Premature extraction is often more expensive to undo than duplication is to live with. Waiting for a third occurrence before abstracting is a reasonable default.

## Applied to this framework

- `wizard/`, `pipeline/` and `rules/` are the single source of truth for content. `cli/` copies them; it never holds a second copy.
- The task-type skills share one body (`pipeline/task-types.md`) instead of eleven near-identical files.
- Agents don't get duplicated per harness — they live once in `pipeline/agents/`.
