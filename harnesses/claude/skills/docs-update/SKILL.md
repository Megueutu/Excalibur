---
name: docs-update
description: Use to check the project's specs for drift against the code they describe — `/docs-update`. Runs the deterministic freshness sweep first, then dispatches judgment to the `docs-updater` subagent, then presents the human with a final list to accept or discard. Not for writing or fixing a spec's content; that stays `spec-writer`'s job.
---

# /docs-update

Anti-spec-drift, end to end: cheap sweep first, judgment only where the sweep found something, human decides last.

## The order matters: cheap first

1. **Deterministic sweep — free, no LLM.** Run:

   ```bash
   wizard/scripts/scan-spec-freshness.sh <sdd-path> --repo <repo-path>
   ```

   `<sdd-path>` is the project's SDD destination (where `specs/` lives). This produces a YAML candidate list from commit history, tags and `depends_on` alone — see `lib/agents/docs-updater.yaml` and `rules/writing-md-obsidian.md#anti-spec-drift-frontmatter` for what the fields mean. If it returns no candidates, say so and stop — there is nothing for judgment to do.

2. **Judgment — only on what the sweep flagged.** Dispatch the `docs-updater` subagent with the candidate list as input. It reads the real diffs behind each candidate and decides real drift vs. noise, writing a one-line reason for anything it confirms. It also updates each confirmed candidate's `freshness_check` field directly — that part is already done by the time it reports back.

3. **Human accept/discard — this skill's own job.** Present the subagent's findings as a short list: spec path, one-line reason, nothing more. This is the orchestration layer, not the judgment layer — don't re-derive or second-guess the subagent's verdict here, just surface it clearly enough to act on.

## Why the split

The same reasoning as `review`'s split from implementation: an agent that judges its own sweep results without the deterministic step first would re-derive commit history from scratch on every run, at real cost, for a question a script already answers for free. And a script alone can't tell a meaningless rename from a change that actually broke what the spec promises — that's exactly the judgment call `docs-updater` exists for.

## What this skill does not do

- Doesn't write or fix a spec's content. A confirmed-stale spec is a task for a human or `spec-writer` to pick up, not something this skill patches.
- Doesn't touch specs the sweep didn't flag. No candidate, no review — the age threshold and commit checks are the whole net.
