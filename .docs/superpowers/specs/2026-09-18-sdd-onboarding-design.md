# SDD Onboarding — design

## Context

Excalibur's onboarding today is `bootstrap/entrypoint.md` (prose-only wizard, 2 questions: SDD destination and GitHub preset) plus `bootstrap/init.sh` (2 hardcoded `cp` calls). The rest of the repo was just fully translated to English (content and filenames), except the legacy `projects/solaria/.contexto/`, which stays untouched pending a separate migration.

The user wants a richer onboarding experience, delivered as its own installable mechanism: run a dedicated skill in a target project, answer a form-like set of questions, and have the agent copy pre-written files into that project's SDD destination — never write new content itself, except for one explicit, isolated exception (translation). Scope for this design is **Claude only** — no other harness, no manifest versioning/update system, no multi-agent code↔spec sync. Those were explicitly deferred in an earlier, broader proposal as premature for a repo serving one harness and, after the Solaria migration, effectively one project.

## Closed decisions

- **Two separate skills, not one.** `sdd-init` (onboarding, run once per project) and `sdd` (pipeline, assumes the SDD destination already exists) are split, instead of one skill branching internally. Keeps onboarding independently testable/versionable and the entry point self-explanatory.

- **Directory layout** (Claude-only, harness-agnostic content stays under `bootstrap/`):
  ```
  bootstrap/
    manifest.yaml
    entrypoint.md
    init.sh
    onboarding/
      github/{conservative.md,direct.md}
      review-depth/{light.md,standard.md,strict.md}
      commit-convention/{conventional.md,free.md}
      templates/            (canonical English spec/decision templates)
  harnesses/claude/
    skills/
      sdd-init/SKILL.md
      sdd/SKILL.md
    agents/
      translator.md
  ```
  `bootstrap/presets/github/` is absorbed into `bootstrap/onboarding/github/` so all onboarding source files live under one browsable, easy-to-extend folder, per the user's explicit ask.

- **Five onboarding questions**, each with fixed options: `destination` (embedded/separate — no file copy, only resolves the target path), `github_preset` (conservative/direct/custom-free-text), `language` (english/other — inferred from the conversation's language, asked explicitly only if unclear), `review_depth` (light/standard/strict), `commit_convention` (conventional/free).

- **`manifest.yaml` is declarative**: each question has an `id`, a `prompt`, and a list of `options`; each option either has a `copy: <source> → <relative-dest>` or has none (when the answer only drives logic, like `destination`, or explicitly requires free text, like `github_preset: custom`). The agent resolves answers into a list of copy pairs — it never decides *which* file to copy by interpreting prose.

- **English is the single frozen source.** `bootstrap/onboarding/templates/` only exists in English. Any other language is produced once, at onboarding time, by translation — never a second frozen copy to maintain, never regenerated automatically later (known limitation, accepted).

- **Translation is a Claude Code subagent (`harnesses/claude/agents/translator.md`), not a skill.** It receives a folder path and a target language, translates every `.md` inside preserving YAML frontmatter keys (only values/body are translated), `[[wikilinks]]`, and callout/heading structure, then returns just the list of files written. Running it as a subagent (Agent tool) keeps the large translated text out of the `sdd-init` conversation's context.

- **`sdd-init` flow**: (1) detect an existing SDD destination via the same convention `bootstrap/entrypoint.md` already documents (`.sdd/` or `../<repo>-sdd/`) and refuse to re-run if found; (2) read `bootstrap/manifest.yaml`; (3) ask each question in the manifest's order, using its literal prompt/options — never inventing or skipping one; (4) for `language`, infer from the conversation, asking explicitly only when unclear; (5) resolve the chosen options into a copy-pair list; (6) call `bootstrap/init.sh` with that list; (7) if the resolved language isn't English, invoke the `translator` subagent against the copied `Templates/` folder; (8) report what was created.

- **`init.sh` contract change**: generalize from two hardcoded `cp` calls to accepting a resolved copy list (origin/destination pairs, one per line, via a temp file or stdin — exact mechanism left to implementation), while keeping its current mode/target-path/project-name validation and exit codes unchanged.

## Open

- Exact mechanism for passing the copy list to `init.sh` (temp file vs. stdin) — decide during implementation.
- Whether `review_depth` and `commit_convention` answers land as separate override files (as sketched in the manifest) or get merged into one — keep them separate unless a simpler shape emerges while implementing.
- Whether `bootstrap/entrypoint.md` keeps documenting the flow in prose alongside `sdd-init/SKILL.md`, or `SKILL.md` becomes the single source and `entrypoint.md` is folded into it — decide during implementation; avoid duplicating the same flow description in two files.
- The translator subagent's re-invocation policy if Excalibur's source templates change after a project has already been onboarded — explicitly out of scope; the project keeps its already-translated copy with no automatic re-sync.
- Actual prose content of the `bootstrap/onboarding/review-depth/*` and `commit-convention/*` files — writing that content is implementation work, not part of this design.

## Roadmap

1. Add `bootstrap/manifest.yaml` with the five questions described above.
2. Create `bootstrap/onboarding/`, moving the existing GitHub presets into `onboarding/github/` and adding `review-depth/` and `commit-convention/`.

   > [!note] Deviation from this roadmap item during implementation
   > No `onboarding/templates/` folder was created. `init.sh` keeps copying `pipeline/spec-template.md` directly instead of a duplicate under `onboarding/` — a second frozen copy would contradict "English is the single frozen source" (see Closed decisions above) by giving the template two places to drift out of sync. `pipeline/spec-template.md` itself already serves as the canonical English source.
3. Generalize `bootstrap/init.sh` to accept a resolved copy list instead of two fixed `cp` calls.
4. Split `harnesses/claude/skills/sdd/SKILL.md` into `sdd-init/SKILL.md` (onboarding) and `sdd/SKILL.md` (pipeline, assumes the SDD destination already exists).
5. Add `harnesses/claude/agents/translator.md`.
6. Update `rules/structure.md` and any remaining references to the old `bootstrap/presets/github/` path.

## General analysis checklist

- [x] Reuse checked — builds on the existing `bootstrap/init.sh`, `bootstrap/presets/github/*`, and `harnesses/claude/skills/sdd/SKILL.md` rather than starting over.
- [x] Minimum scope — Claude-only; no manifest versioning/update system, no multi-agent code↔spec sync, no per-language frozen template matrix (explicitly narrowed down from an earlier, broader proposal).
- [ ] Applicable commit/PR rules — N/A in this document.
- [x] No migration of `projects/solaria/.contexto/` — out of scope, unchanged.
