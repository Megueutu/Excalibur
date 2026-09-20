# Implementation notes — round 2

Companion to `IMPLEMENTATION_PLAN_2.md`. Source: `excalibur-anti-spec-drift.md`
and `excalibur-implementacao-2.md` (user-provided, outside the repo), both
explicitly written as implementation-ready prompts against the round-1
foundation (`IMPLEMENTATION_PLAN.md`, 43/43 done, verified end-to-end).

---

## Reconciliation before starting

Local `main` was stale — 8 commits behind `origin/main`, which already had the
entire round-1 foundation (rebased, no conflicts; see `IMPLEMENTATION_NOTES.md`
for round 1's own decisions). Reconciled by rebasing the one round-2-adjacent
commit onto `origin/main` before any round-2 work started.

## Work split

Four independent, file-disjoint tracks, run in parallel:

- **Track A** — sections 1, 2, 3, 8 (anti-spec-drift frontmatter + `/docs-update`,
  Scenthound, token-budget rules, and the "visible SDD" vs. "operational
  Excalibur" naming in `rules/writing-md-obsidian.md`, grouped with 1 since
  both touch that same file).
- **Track B** — section 4 + 5.3 (`doctor`/`list`/`canvas`/`diff`/`lint` CLI
  commands, `validate-md-size.sh`).
- **Track C** — sections 5.1, 5.2, 5.4, 5.5, 6 (`detect-monorepo.sh`,
  `detect-ci.sh`, `scaffold-obsidian-vault.sh`, `setup-new-repo.sh` with
  `github_preset` branching).
- **Track D** — sections 7, 9 (`bootstrap-check.ps1`, `sdd_path` self-healing).

Track B stalled mid-run on a network hiccup during its final smoke-test step
(after all files were already written and `node --check`-clean); its file
output was intact, verified independently, and no rework was needed.

## Gap found and fixed after the tracks landed

Track D's `sdd_path`/marker logic lives in `cli/src/lib/config.js` and is
called from `cli/src/commands/init.js` — but `excalibur init` only collects
answers and installs `.excalibur/`; the actual SDD folder is materialized
later by `wizard/init.sh` (the harness step, not the CLI). Track D's own
`writeSddMarker` already anticipated this (it's a no-op if the destination
doesn't exist yet, and says so in its doc comment) and flagged it for
follow-up rather than silently leaving a gap. Fixed by adding the marker
`touch` directly to `wizard/init.sh`, next to where it already creates the
destination's `.gitkeep` files — the one place all three destination modes
(`embedded`/`separate`/`external`) funnel through.

## Decisions made without a stop-and-ask (all within what the source docs
already decided)

- **`docs-updater` agent's `Edit` scope**: the source doc doesn't give this
  agent write access anywhere explicitly (`review`, the closest analogue, has
  no `Write`/`Edit` either) — but the `/docs-update` flow requires *something*
  to flip `freshness_check` after a human accepts a stale spec. Gave
  `docs-updater` `Edit`, scoped by instruction (not by tooling — Claude Code
  has no field-level permission) to only touch that one frontmatter key.
- **`scan-spec-freshness.sh` output format**: YAML to stdout by default, or to
  a file via `--output`, matching the pattern already used by
  `wizard/scripts/record-history.sh` from round 1.
- **`setup-new-repo.sh`'s `conservative` ruleset creation**: falls back to a
  warning (not a hard failure) if the `gh api` ruleset call fails, so a
  missing permission or an unsupported `gh` version doesn't block the rest of
  onboarding.
- **`excalibur canvas`/`doctor`'s Canvas-staleness check**: heuristic
  (mtime/content-reference comparison against current `tasks.yaml` files),
  not a precise diff — the source doc doesn't specify a mechanism, and a
  best-effort heuristic avoids over-building a feature nothing in round 1
  needed elsewhere. Documented as a heuristic in a code comment.
- **`excalibur lint`**: shells out to `validate-md-size.sh` rather than
  reimplementing the size-limit logic in JS, avoiding a second source of
  truth for the same check the `review` agent already relies on.

## Verification executed

- `bash -n` on every new/edited `.sh` script (7 total, including
  `wizard/init.sh` after the marker fix).
- `node --check` on every new/edited `.js` file (all 23 files under `cli/`).
- `node cli/bin/excalibur.js --help` — confirms all 5 new commands
  (`doctor`, `list`/`tasks`, `canvas`, `diff`, `lint`) are registered and
  listed correctly.
- `scan-spec-freshness.sh` smoke-tested end-to-end against a synthetic SDD
  tree (outside the repo, removed after) — correctly flagged an age-based
  candidate, correct YAML both to stdout and `--output`.

**Not exercised**: the full onboarding flow with the new manifest-driven
scripts wired in end-to-end (`detect-monorepo`/`detect-ci` feeding the
post-manifest interpreter, `setup-new-repo.sh`'s `conservative` ruleset
against a real GitHub repo, `scaffold-obsidian-vault.sh` opened in a real
Obsidian install). Same gap already logged as `PENDENCIAS.md` item 14 for
round 1 — a guided end-to-end session against a real target project would
resolve this and item 14 together.

## Etapas bloqueadas

None. All 27 checklist items in `IMPLEMENTATION_PLAN_2.md` are done.
