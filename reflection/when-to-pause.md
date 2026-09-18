# Reflection — when to stop and ask instead of deciding alone

Core rule: **a decision without absolute certainty is not a decision to make alone.** "Absolute certainty" here means: if this choice turned out wrong, the rework to undo it would be expensive (multiple files, multiple repos, or something already committed/pushed). In those cases, stopping to ask is cheaper than guessing.

## Signs it's time to stop (don't keep going even if it feels productive)

| Thought | Reality |
|---|---|
| "This is probably what they meant" | If "probably" is the most you can say, that's a question, not an assumption to make. |
| "There are two ways to do this, I'll pick the one that seems more common" | "More common" is not the same as "what this repo/organization already does". Check the existing pattern before inventing one. |
| "I've already done too much to turn back and ask now" | Sunk cost isn't a reason to keep going down a wrong path — it's cheaper to stop now than to finish and redo it. |
| "This is kind of obvious, I don't need to confirm" | Obvious to whom? If the task was classified as Feature/Big feature (see [entrypoint.md](../pipeline/entrypoint.md)), the very fact that there's an open design decision is a sign "obvious" might not hold. |
| "I'll implement it both ways and they can choose later" | That's rework disguised as caution — ask first, don't implement in duplicate. |
| "This lib/service should follow this pattern because the others do" | Assuming symmetry between repos/modules without checking is a recurring mistake — see the project's repo inventory (`.contexto/repos.md`, if it exists) before assuming. Verify before assuming. |

## What to do when one of these signs hits

1. Don't implement the uncertain part yet — implement what's already confirmed, if it makes sense to isolate it.
2. Phrase the question so the answer is quick to give (closed question, with the recommended option first) — don't dump a block of generic doubts.
3. If there's more than one uncertainty, group them into a single round of questions instead of interrupting repeatedly.

## Where this doesn't apply

Tasks classified as **Fix** with an obvious cause don't need this process — reflection exists for design decisions, not for every line of code. Don't confuse "being careful" with "asking about everything" — that's closer to inefficiency than to safety.
