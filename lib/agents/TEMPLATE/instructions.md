# TODO: Title

One sentence: what this agent owns, and why it exists as its own agent instead of folding into an existing one. If the answer is "it doesn't, really," that's a sign this shouldn't be a new agent.

## Input

What arrives in the handoff (see `lib/pipeline/handoff-template.md`). Be explicit about what this agent does NOT have — it runs isolated, with no memory of the user's session and no access to anything not named here.

## What to do

The actual procedure. Number the steps if order matters; don't if it doesn't (see `rules/heuristics/tasks-ordering.yaml` for the same "ordered vs. not" judgment call applied to task checklists).

## Output

What this agent hands back, and to whom. If it writes a file, name the exact file and who reads it next.

## Never

The boundary. What this agent must not do even if it seems efficient in the moment — usually mirrors the `tools:` restriction in `agent.yaml` (e.g. "never edit code" for an agent with no `Write`/`Edit`), stated in prose so it's unambiguous even to a reader who didn't check the frontmatter.
