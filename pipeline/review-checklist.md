# Final checklist — before announcing a task as complete

This is not reference reading. It's a mandatory execution step with visible output. "I already read this file" does not count as having run it.

**How to run it, without exception:**

1. Run `git diff` (or equivalent) over everything that changed — actually look at the diff, don't trust your memory of what was written.
2. On **Feature** / **Big feature**: dispatch the `review` agent (`pipeline/agents/review.md`) with the diff and this file, and ask for a verdict item by item. A fresh agent without the "I already think I'm done" bias catches more. On a **Fix**, do it inline, but still explicitly.
3. Write the final answer citing the result of each item below. It doesn't have to be long, but each item has to have actually been checked, not presumed.

If any item fails, fix it before considering the task complete — never report it as done with a caveat attached.

Skip this entirely only when the session sets `skip-review`.

## Code comments

- No new comment should exist in the diff unless the user explicitly asked for one in this task.
- If a comment was added "to make it clearer" without being asked for — remove it before committing.

## AI trace

- `git diff` (or `grep -ri "claude\|anthropic\|co-authored-by\|generated with"`) over everything about to be committed. None of it may appear in code, commits, PRs or filenames.
- This follows the project's git preset — a project that chose to allow attribution overrides this item.

## Commit / PR format

- Commits follow the project's convention (`commit-convention.md` in the SDD destination).
- PR policy follows the project's `pr_policy` answer: follow the git preset, always, or never. Before opening one, check whether a PR already exists for this branch.

## Scope

- Nothing was implemented beyond what was asked. If something extra was done because it seemed related, decide whether to remove it or ask before keeping it.
- If the repo touched needs extra care, re-confirm the change is minimal and surgical.

## Tests

- Follows the project's `testing_policy`:
  - **required** → a Feature/Big feature without a test fails this item.
  - **never** → no test is expected; a test added unasked is a scope violation.
  - **case_by_case** → `design.md` records the decision, and the implementation honored it.

## CI/CD

- Only when the project answered `ci_cd` with something other than `none`: confirm the pipeline passed before considering the task done. A red pipeline is a failed item, not a note.

## Spec (Feature / Big feature)

- The task folder reflects what was actually implemented. If the plan changed along the way, `spec.md` and `design.md` change with it — never leave the spec describing something the code no longer does.
- Every genuinely finished item in `tasks.yaml` is flipped to `done`. Partially finished stays `pending`.

## Markdown size

- Any `.md` touched in this task that belongs to an allowlisted type in `rules/md-size-limits.yaml` is under its limit. If it isn't, granularize before the task can be called done: split by subject with clear names — never `file-1.md`, `file-2.md` — and link the pieces.
- A file type that isn't in the allowlist has **no limit** and is not checked. Most files are in this category, on purpose.

## History

- `history.yaml` has an entry for this task, written through `wizard/scripts/record-history.sh`, unless the session sets `no-history`.

## Canvas

- Walk `rules/canvas-update-checklist.yaml`. For every item that changed, the corresponding node in the project `.canvas` was updated.
