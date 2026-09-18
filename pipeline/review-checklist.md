# Final checklist — before announcing the task as done

This is not reference reading — it's a mandatory execution step, with visible output. "I already read the file earlier" doesn't count as having run it.

**How to run it, no exceptions:**
1. Run `git diff` (or equivalent) over everything that changed — look at the actual diff, don't rely on memory of what was written.
2. On **Feature**/**Big feature**: use the Agent tool to open a dedicated review subagent, passing it the diff and this file, and ask for an item-by-item verdict — a fresh agent without the "I already think I'm done" bias catches more. On **Fix**, do this inline, but still explicitly.
3. Write the final response citing the result of each item below (doesn't need to be a long report, but each item needs to have actually been checked, not assumed).

If any item fails, fix it before considering the task done — don't report it as ready with a caveat.

## Code comments
- No new comment should exist in the diff, unless the user explicitly asked for it in that task.
- If a comment was added "to make it easier to understand" without being asked — remove it before committing.

## AI trail
- `git diff` (or `grep -ri "claude\|anthropic\|co-authored-by\|generated with"`) over everything about to be committed — none of that can appear in code, commit, PR, or file name. See the project's general code rules (`code-standards.md`, if it exists in the project's SDD destination — embedded `.sdd/` or separate `<repo>-sdd/`).

## Commit/PR format
- Commits follow the project's conventions (`commits.md`, if it exists).
- If opening a PR: title and body follow the project's conventions (`pr.md`, if it exists) — also check whether a PR is already open for this branch before opening another one.

## Scope
- Nothing was implemented beyond what was asked (minimum rework) — if something "extra" was done because it seemed related, decide whether to remove it or ask before keeping it.
- If the repo touched requires extra care (see the project's repo inventory, if it exists), double-check that the change is minimal and surgical.

## Spec (Feature/Big feature)
- The `spec.md` file in the project's SDD destination (embedded `.sdd/` or separate `<repo>-sdd/`, see [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md)), at `specs/<repo>/<task>/spec.md`, reflects what was actually implemented (update it if the plan changed along the way) — don't leave the spec out of sync with the code.
