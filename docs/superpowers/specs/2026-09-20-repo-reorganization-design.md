# Repository reorganization — design

## Context

Round 1 and round 2 built the whole framework (CLI, agents, skills, rules)
but organically, section by section, following `excalibur-design-doc.md`'s
own section order. The result works but the directory layout accumulated
friction the user flagged directly: `cli/`'s name doesn't fit once it splits
into a scaffold step and an ongoing tool; `wizard/` mixes onboarding-only
content with scripts agents reuse at runtime; `pipeline/agents/` uses `.md`
when a structured format would let personas/tools be referenced instead of
copy-pasted; process-tracking files (`IMPLEMENTATION_NOTES*.md`,
`PENDENCIAS.md`) sit at the repo root next to files a real visitor would
read; and there's no mechanism yet for an optional feature (Obsidian being
the first) to leave standing, always-loaded instructions in a target
project — today's `architecture/` is deliberately *selective* per handoff,
which is a different thing.

This spec covers the **target directory structure and the mechanisms behind
it** (agent format, feature fragments, CLAUDE.md, package split). It does
not cover writing new prose content beyond what's needed to relocate
existing content — that's implementation work.

## Closed decisions

- **Agents become YAML-sourced.** `lib/agents/<name>.yaml` replaces
  `pipeline/agents/<name>.md` as the source of truth: tool allowlist,
  referenced skills/personas, and metadata live in structured YAML instead
  of frontmatter. A build step (extending `cli/src/lib/build.js`, which
  already resolves `.excalibur.custom/` → `.excalibur/` fallback) now also
  converts each agent's YAML into the `.md` + frontmatter file Claude Code's
  native subagent format actually requires, written to
  `.excalibur/agents/<name>.md` and then to `.claude/agents/<name>.md` in
  the target project. The agent's prose body (instructions) stays as a
  field in the YAML (a multi-line string) — the minimal hand-rolled YAML
  parser (`cli/src/lib/yaml.js`) needs to support this; if its current
  subset can't express multi-line prose cleanly, extending it is part of
  the implementation, not a reason to fall back to a separate `.md` body
  file.

- **Personas stay native Skills**, not `.md` files. `guardrail` (and any
  future persona) continues to live in `harnesses/claude/skills/guardrail/`
  and is referenced from an agent's YAML the same way it's referenced from
  today's frontmatter: `skills: [guardrail]`. This is harness-specific by
  nature (Skills are a Claude Code mechanism) — a future non-Claude harness
  would need its own equivalent, out of scope here.

- **`reflection/` stays a top-level directory**, not folded into `lib/`.
  It's the one piece of "how to think" content that's translated into the
  project's language and meant for human reading — keeping it structurally
  separate from `lib/` (always English, agent-only) means the translator
  doesn't need a file-by-file exception list inside `lib/`, just "is it a
  top-level dir reserved for visible content."

- **`docs/` splits by audience.** `docs/repo/` (`purpose.md`, `structure.md`,
  `git.md`, `adding-a-harness.md` — real documentation about how Excalibur
  itself is organized) stays visible at `docs/repo/`. Everything that's a
  trace of AI-assisted development process — `docs/superpowers/` (brainstorm
  specs and plans, including this file once this round ships),
  `IMPLEMENTATION_PLAN*.md`, `IMPLEMENTATION_NOTES*.md`, `PENDENCIAS.md` —
  moves under `.docs/` (hidden) at the repo root.

- **The CLI splits into two npm packages.** `create-excalibur/` is scaffold
  only — the `npm create excalibur` entry point (the package must be named
  `create-<name>` for that npm convention to resolve it), covering exactly
  what `wizard/` covers today: the 13-question form and materializing the
  target project. `excalibur/` is everything that runs afterward, ongoing —
  today's `cli/` (`init` moves here conceptually as "(re)apply", `update`,
  `customize`, `check`, `status`, `doctor`, `list`, `canvas`, `diff`,
  `lint`, `session`, `reset`, `clean`, `clean-history`, `kill-my-self`).
  `create-excalibur` installs `excalibur` as part of what it writes into
  the target project, so `npx excalibur <command>` works immediately after
  scaffolding without a second install step.

- **`wizard/` renames to `onboarding/` and moves inside `create-excalibur/`.**
  It keeps `manifest.yaml`, its own flow description (renamed from
  `entrypoint.md` to `onboarding/flow.md` — see Open, this avoids colliding
  in name with `lib/pipeline/entrypoint.md`, a completely different
  document), `init.sh`, and the `onboarding/` source-snippet folder
  (`github/`, `review-depth/`, `commit-convention/`, `testing-policy/`,
  `history-cleanup/`).

- **All of `wizard/scripts/` moves to `lib/scripts/`, undivided.** Even
  scripts that today only run during onboarding (`install-gh-*.sh`,
  `create-github-repo.sh`, `setup-new-repo.sh`, `detect-os.sh`) move there,
  alongside the ones agents already call at runtime
  (`detect-stack.sh`, `record-history.sh`, `scan-spec-freshness.sh`,
  `validate-md-size.sh`, etc.). Reasoning: several onboarding-only scripts
  today could plausibly be re-run later (`detect-ci.sh`,
  `detect-monorepo.sh` are just as useful mid-project as at onboarding), and
  splitting by "current" caller means moving a script again the first time
  its usage changes. One shared location, one migration.

- **All of `pipeline/` (not just `agents/`) moves into `lib/`.**
  `entrypoint.md`, `task-types.md`, `spec-template.md`, `review-checklist.md`,
  `handoff-template.md` become `lib/pipeline/*.md`. `lib/` is now the single
  directory for "operational Excalibur, English-only, agent-consumed":
  `lib/agents/` (YAML), `lib/scripts/` (`.sh`), `lib/pipeline/` (process
  `.md`), `lib/features/` (see below).

- **New mechanism: feature fragments.** `lib/features/<feature>.md` is a
  standing-instruction fragment for one optional capability (Obsidian is
  the first: `lib/features/obsidian.md`). Whether a feature's fragment gets
  installed is driven by the corresponding manifest answer (Obsidian's
  `obsidian_vault` question already exists; future features add their own
  manifest question the same way). Installed fragments land in
  `.excalibur/context/<feature>.md` in the target project — a folder that,
  unlike `architecture/`, is meant to be read **in full, every session**,
  not selectively per handoff. This is generic from day one: any future
  optional capability follows the same pattern (a `lib/features/*.md`
  source + a manifest question that gates whether it's installed), not a
  one-off for Obsidian.

- **`excalibur init`/`create-excalibur` now writes a real `CLAUDE.md`** at
  the target project's root — part of the regenerable `.excalibur/`
  machinery (rewritten by `excalibur update`, like everything else there).
  It points the harness at `.excalibur/context/` (read in full, every
  session) and at `lib/pipeline/entrypoint.md`'s flow (the four layers:
  orchestrator → spec → implement → review) so a brand-new session picks up
  the Excalibur flow without the user needing to invoke a skill manually
  first. This directly answers the open question from this round's earlier
  discussion ("AGENTS.md e CLAUDE.md, temos que refinar isso") —
  `AGENTS.md` stays read-only/external-convention as already decided;
  `CLAUDE.md` becomes something Excalibur owns and writes.

- **`rules/` groups its mechanical YAML heuristics.** `md-size-limits.yaml`,
  `tasks-ordering.yaml`, `canvas-update-checklist.yaml` move into
  `rules/heuristics/`, separating "machine-checked heuristic table" from
  the prose `.md` rules that sit alongside them today
  (`naming.md`, `interaction.md`, `prompt-cache.md`, `writing-md-obsidian.md`,
  `token-budget.md`, which stay at `rules/` top level next to `global/` and
  `stacks/`).

- **`harnesses/claude/skills/` groups the 11 task-type skills.**
  `feat/`, `fix/`, `refactor/`, `perf/`, `test/`, `docs/`, `style/`,
  `build/`, `ci/`, `chore/`, `revert/` move under
  `skills/task-types/<type>/`, since they already share one body
  (`lib/pipeline/task-types.md`) and are a clear, closed category. Every
  other skill (`sdd`, `guardrail`, `magic-book`, `try-gh`,
  `excalibur-init`, `excalibur-skill-create`, `docs-update`,
  `scenthound-scan`) stays flat at `skills/` — they don't share a body and
  don't form as clean a category among themselves.

## Target tree

```
Excalibur/
  create-excalibur/
    package.json
    bin/create-excalibur.js
    src/...
    onboarding/
      manifest.yaml
      flow.md
      init.sh
      onboarding/
        github/  review-depth/  commit-convention/  testing-policy/  history-cleanup/
  excalibur/
    package.json
    bin/excalibur.js
    src/commands/*.js
    src/lib/*.js
  lib/
    agents/*.yaml
    scripts/*.sh
    pipeline/
      entrypoint.md  task-types.md  spec-template.md  review-checklist.md  handoff-template.md
    features/*.md
  harnesses/
    claude/
      skills/
        task-types/{feat,fix,refactor,perf,test,docs,style,build,ci,chore,revert}/SKILL.md
        sdd/  guardrail/  magic-book/  try-gh/
        excalibur-init/  excalibur-skill-create/  docs-update/  scenthound-scan/
  reflection/
    reasoning-chain.md  when-to-pause.md
  rules/
    global/{kiss,yagni,dry,solid}.md
    stacks/{languages,frameworks,ides}/*.yaml
    heuristics/{md-size-limits,tasks-ordering,canvas-update-checklist}.yaml
    naming.md  interaction.md  prompt-cache.md  writing-md-obsidian.md  token-budget.md
  docs/
    repo/{purpose,structure,git,adding-a-harness}.md
  .docs/
    superpowers/{specs,plans}/...
    IMPLEMENTATION_PLAN.md  IMPLEMENTATION_PLAN_2.md
    IMPLEMENTATION_NOTES.md  IMPLEMENTATION_NOTES_2.md
    PENDENCIAS.md
  README.md
  LICENSE
```

Target project, after `npm create excalibur` + first `excalibur init`:

```
Excalibur                    (root config — destination mode, sdd_path, etc.)
CLAUDE.md                    (new — points at .excalibur/context/ and the pipeline flow)
.excalibur/
  agents/*.md                (built from lib/agents/*.yaml)
  skills/                    (copied harness skills)
  scripts/                   (from lib/scripts/)
  pipeline/                  (from lib/pipeline/)
  rules/                     (from rules/)
  context/*.md               (new — installed feature fragments, e.g. obsidian.md)
  _migrations/
.excalibur.custom/
  manifest.yaml
  <mirrored overrides>
.excalibur-session.yaml
.excalibur-answers.yaml
<sdd destination>/           (.sdd/, docs/, or wherever the user chose)
  specs/  ideas/  architecture/  Templates/  reflection/
  .excalibur-sdd-marker
```

## Open (decide during implementation)

- Exact name for `.excalibur/context/` — went with `context/` in this spec
  for lack of a better one; revisit if something clearer comes up while
  writing `CLAUDE.md`'s own content (it needs to describe this folder in
  one line, which is a good test of whether the name is self-explanatory).
- Whether `create-excalibur`'s install step vendors a copy of the `excalibur`
  package or adds it as a real `package.json` dependency of the target
  project — affects how `excalibur update` later gets new versions.
- Exact shape of the YAML→`.md` agent build step (multi-line prose field
  name in the YAML schema, how `cli/src/lib/yaml.js`'s subset needs to grow)
  — implementation detail, not a design-level open question, but flagged
  since it's the riskiest single piece of this reorganization.
- Whether `lib/features/` fragments can themselves be customized via
  `.excalibur.custom/` the same way any other shipped file can — almost
  certainly yes (it's just another path under `.excalibur/`), confirm no
  special case is needed during implementation.
- Migration mechanics for existing target projects that already ran round-1
  `excalibur init` before this reorg (old `.excalibur/pipeline/agents/*.md`
  shape) — likely handled by the existing migration-map mechanism
  (`cli/src/lib/migrations.js`, §22 of the original design doc), but this
  round's migration entry needs to be written, not just the mechanism reused.

## Roadmap

1. Move `pipeline/` → `lib/pipeline/`, `pipeline/agents/*.md` → convert to
   `lib/agents/*.yaml` (content migration, not just file move).
2. Move `wizard/scripts/` → `lib/scripts/`.
3. Add `lib/features/obsidian.md`, wire the `obsidian_vault` manifest answer
   to install it into `.excalibur/context/`.
4. Extend `cli/src/lib/build.js` (staying under today's `cli/` until step 8)
   to convert `lib/agents/*.yaml` into `.claude/agents/*.md`.
5. Add `CLAUDE.md` generation to `init`, wire it into `update`.
6. Regroup `rules/` heuristics into `rules/heuristics/`.
7. Regroup the 11 task-type skills into `harnesses/claude/skills/task-types/`.
8. Split `cli/` into `create-excalibur/` + `excalibur/` packages; move
   `wizard/` → `create-excalibur/onboarding/` (renaming its `entrypoint.md`
   to `flow.md`).
9. Move `docs/superpowers/`, `IMPLEMENTATION_PLAN*.md`,
   `IMPLEMENTATION_NOTES*.md`, `PENDENCIAS.md` under `.docs/`. Do this step
   last so every other step's own tracking docs land in their final home
   directly, instead of being written under `docs/` and moved again.
10. Update every cross-reference (`README.md`, `docs/repo/structure.md`,
    every `.md` that links to a moved path) — do this incrementally as each
    step above lands, not as one giant sweep at the end.

## General analysis checklist

- [x] Reuse checked — extends `cli/src/lib/build.js`'s existing
      resolve+materialize step rather than building a second mechanism for
      YAML→`.md` conversion; reuses `cli/src/lib/migrations.js` for the
      target-project migration path.
- [x] Minimum scope — no new features beyond what the user described in
      this conversation; `lib/features/` ships with exactly one fragment
      (Obsidian) even though the mechanism is generic.
- [ ] Applicable commit/PR rules — commits go straight to `main`, no PR,
      English, lowercase, per this session's standing instruction.
- [x] No change to already-decided multi-harness scope (Claude-only) —
      `harnesses/claude/` stays the only harness implementation; nothing
      here generalizes it.
