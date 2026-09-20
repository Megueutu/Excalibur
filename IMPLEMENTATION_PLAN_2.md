# Implementation plan — round 2 (anti-spec-drift + new commands/scripts)

Checklist derived from `excalibur-anti-spec-drift.md` and
`excalibur-implementacao-2.md` (both user-provided, outside the repo).
Builds on the round 1 foundation (`IMPLEMENTATION_PLAN.md`, 43/43 done).
Same numbering convention as round 1 (section 16 of the design doc):
hierarchical numbering when steps depend on order, simple list when
independent.

Legend: `[ ]` pending · `[x]` done · `[!]` blocked (reason in
`IMPLEMENTATION_NOTES_2.md`)

---

## 1. Anti spec drift

- [x] 1.1 Add the frontmatter fields (`spec_id`, `status`, `last_updated`,
      `linked_commit`, `linked_release`, `depends_on`, `freshness_check`) to
      `pipeline/spec-template.md` and document them in
      `rules/writing-md-obsidian.md`
- [x] 1.2 `wizard/scripts/scan-spec-freshness.sh` — deterministic sweep:
      commits touching a spec's referenced files since `linked_commit`,
      releases/tags since `last_updated`, `depends_on` staleness, age
      threshold; outputs a YAML candidate list for the agent step
- [x] 1.3 `pipeline/agents/docs-updater.md` — judgment-only step: reads the
      candidate list + relevant diffs, decides real staleness vs. noise,
      writes a one-line reason per flagged spec
- [x] 1.4 `harnesses/claude/skills/docs-update/SKILL.md` — runs 1.2 then
      delegates to 1.3, updates each stale spec's `freshness_check`, reports
      the list for human accept/discard

## 2. Scenthound (pre-push security guardrail)

- [x] 2.1 `pipeline/agents/scenthound.md` — agent (not skill), `guardrail`
      persona, `tools: Read, Grep, Bash` (no `Write`/`Edit` — reports, never
      patches), verdict output (`approved`/`attention`/`blocked`)
- [x] 2.2 `harnesses/claude/skills/scenthound-scan/SKILL.md` — thin
      command-shaped wrapper that invokes the `scenthound` subagent and
      surfaces its verdict; caller doesn't need to know it's a full agent

## 3. Token budget guidance

- [x] 3.1 `rules/token-budget.md` — the recommendations from the source doc
      (measure before optimizing, small scope per task, routing by
      complexity, caching, don't over-cache short sessions), referencing
      `docs-update` and `scenthound-scan` as the "small scope per task"
      examples in practice

## 4. New CLI commands

- [x] 4.1 `excalibur doctor` — deeper than `check`: orphaned customization
      after a version migration, missing `README.md` in a top-level folder,
      Canvas out of sync with `tasks.yaml`
- [x] 4.2 `excalibur list` (alias `tasks`) — lists in-progress tasks
      (`specs/<repo>/*/`) with status from each `tasks.yaml`
- [x] 4.3 `excalibur canvas` — regenerates the project Canvas on demand,
      outside the review agent's automatic cycle
- [x] 4.4 `excalibur diff` — shows `.excalibur.custom/` vs. `.excalibur/`
      defaults, complementing `status`
- [x] 4.5 `excalibur lint` — runs the `.md` size-limit + naming-convention
      checks manually, outside the review agent flow (usable from the
      target project's own CI)

## 5. New scripts

- [x] 5.1 `wizard/scripts/detect-monorepo.sh` — detects
      `lerna.json`/`pnpm-workspace.yaml`/`turbo.json`/`nx.json`, feeds the
      post-manifest interpreter agent
- [x] 5.2 `wizard/scripts/detect-ci.sh` — detects existing
      `.github/workflows/` (or equivalent), avoids asking the manifest
      question when it's detectable
- [x] 5.3 `wizard/scripts/validate-md-size.sh` — mechanical check against
      `rules/md-size-limits.yaml`, callable by `excalibur lint` (4.5) and the
      review agent
- [x] 5.4 `wizard/scripts/scaffold-obsidian-vault.sh` — materializes
      `.obsidian/` config when `obsidian_vault: vault` is chosen in the
      manifest (closes the gap: this option existed but nothing built it)
- [x] 5.5 `wizard/scripts/setup-new-repo.sh` — see section 6

## 6. `setup-new-repo.sh` behavior by `github_preset`

- [x] 6.1 Base repo config (description, default branch) — all presets
- [x] 6.2 `conservative` — create a ruleset requiring PR before merge to main
      (`gh api`/`gh ruleset create`) + add
      `.github/pull_request_template.md` referencing the Excalibur structure
      (`proposal.md`/`spec.md`/`design.md`/`tasks.yaml`)
- [x] 6.3 `direct` — skip ruleset creation entirely
- [x] 6.4 `custom` — behavior deferred, matches the manifest's own open-ended
      `custom` semantics (no fixed script behavior until the manifest answer
      itself is more defined)

## 7. Windows bootstrap wrapper

- [x] 7.1 `bootstrap-check.ps1` — the one justified `.ps1`/`.bat` wrapper:
      checks `bash` on PATH, guides Git Bash install if missing; everything
      else stays `.sh`

## 8. Obsidian rule: "visible SDD" vs. "operational Excalibur" naming

- [x] 8.1 Update the opening of `rules/writing-md-obsidian.md` to explicitly
      name both categories and explain *why* operational content is
      excluded (not an accident of location — nobody browses
      `pipeline/agents/orchestrator.md` in Obsidian) so the rule is
      self-sufficient without the original design doc's context

## 9. Robust SDD path location (self-healing)

- [x] 9.1 `excalibur init` creates a hidden marker file inside the SDD
      folder (e.g. `.excalibur-sdd-marker`, empty)
- [x] 9.2 `Excalibur` root config gains a new field: `sdd_path` — the
      literal resolved path, read first by any agent/skill needing to find
      the SDD
- [x] 9.3 `pipeline/sdd-path-recovery.md` — recovery procedure, referenced
      by `magic-book`: read `sdd_path` → if missing, scan first-level
      candidates for the marker file → found elsewhere → auto-correct
      `sdd_path` + log a note (not a `history.yaml` entry) → not found
      anywhere → ask the user once, then update the config
