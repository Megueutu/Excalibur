---
name: decision-log
description: Use when a choice is made that someone could later question or want to reverse - a design, an approach, an exclusion. Writes one short decision note in the SDD with the reason and how to undo it.
---

# Decision log

One note per decision, written when the decision is made, not reconstructed afterwards.

## When to write one

- The choice has more than one reasonable answer and a reader would ask "why this one?".
- Undoing it later would take real effort.
- You made it on the user's behalf without asking.

Skip routine choices that follow an existing convention.

## Where and how

Create `decisions/YYYY-MM-DD-slug.md` under the SDD destination (read it from `sdd_path` in the project config). A decision is a moment in time, so the file is dated and never edited afterwards. To change a decision, write a new note and mark the old one `superseded`.

```markdown
---
status: accepted        # accepted | superseded
date: YYYY-MM-DD
task: <task-slug, if any>
---

# <the decision, as one plain sentence>

**Why:** the reason, in one or two sentences.
**Instead of:** the options that were set aside, and why.
**To undo:** what reversing it would take.
```

## Rules

- Keep it under thirty lines. If it needs more, the decision is probably several.
- Write for a reader who was not there. No shorthand from the conversation.
- Link the task or spec it belongs to with a wikilink, when the project uses them.
- Never record a secret, a credential or personal data.
