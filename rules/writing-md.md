# Writing markdown for the SDD

Applies to **every** `.md` in the SDD destination, not only specs. The SDD isn't just instructions for an agent: it is the project's living documentation, and a human has to be able to navigate it.

Excalibur guarantees the notes read well in any plain Markdown viewer. Modules may add conventions on top (a link style, emphasis blocks, a project map); when one is active, its context says so and its rule file takes precedence where they differ.

## Two categories of markdown, and only one of them is this file's business

Excalibur's repository contains two very different kinds of `.md`, and this file governs exactly one of them:

- **Visible SDD** — `specs/`, `architecture/`, `ideas/`, everything written to the SDD destination inside a target project. It is translated to the project's own language, it is meant for a human to read and collaborate on, and it lives somewhere a person actually opens. This is what every rule below applies to.
- **Operational Excalibur** — the installed package (`node_modules/@easy-spec/excalibur/`), `lib/pipeline/`, `rules/` themselves, `lib/onboarding/`, `harnesses/`. Fixed English, agent-only consumption. This category is **excluded on purpose, not by accident of where the files happen to sit.** Nobody browses `lib/agents/orchestrator/agent.yaml` looking for backlinks: it's content an agent reads to know how to behave, not a note a person walks through. Frontmatter shaped for queries, links that feed a graph view, emphasis sized for visual scanning: none of that serves a file whose only reader is a model executing it as instructions.

If you're editing something under `lib/pipeline/`, `rules/`, `lib/onboarding/`, `harnesses/`, or the installed package (`node_modules/@easy-spec/excalibur/`), this file's conventions do not apply to it. Its own house style (YAML frontmatter for agents/skills, plain Markdown headings, plain links, English-only) is set by the files already there — see `lib/agents/review/agent.yaml` or `harnesses/claude/skills/try-gh/SKILL.md` for the pattern to follow instead.

## Frontmatter

Every task document opens with YAML frontmatter:

```yaml
---
status: in-progress    # in-progress | done | paused
project: <project-name>
task: <task-slug>
class: feature         # fix | feature | big-feature
created: YYYY-MM-DD
---
```

`status` and `class` are what you'll actually want to filter on later (with whatever query tool the project uses). Keep them current — a file left at `in-progress` forever makes every query useless.

Keys stay in English even when the project's language isn't: they're queried, not read.

## Anti-spec-drift frontmatter

`spec.md` (see `lib/pipeline/spec-template.md`) carries a second, separate block of frontmatter fields on top of `status`/`project`/`task`/`class`/`created` above. These exist so drift between a spec and the code it describes can be detected mechanically instead of discovered by accident:

| Field | Meaning |
|---|---|
| `spec_id` | Stable identifier for the spec — the task slug, unless the project has a different convention. What `depends_on` on other specs points at. |
| `status` | `draft \| in_progress \| blocked \| done \| obsolete` — the spec's own lifecycle, independent of `freshness_check` below. A `done` spec can still go stale later. |
| `last_updated` | Date the spec's content was last genuinely revised — not touched, revised. Bumped by whoever edits the spec. |
| `linked_commit` | The commit the spec was last verified against. `lib/scripts/scan-spec-freshness.sh` diffs from here forward. |
| `linked_release` | Optional. A tag/release this spec's described behavior shipped in — omit until it actually has. |
| `depends_on` | List of other `spec_id`s this one assumes are still true. If one of those goes stale, this one is a candidate too. |
| `freshness_check` | `ok \| stale \| pending` — the last verdict from the drift pipeline. `pending` until the pipeline has run at least once. |

Who writes what: a human or `scribe` sets `spec_id`, `status` and `depends_on` when the spec is written or revised, and bumps `last_updated`/`linked_commit` on a genuine revision. `freshness_check` is the one field `clerk` (`lib/agents/clerk/agent.yaml`) is allowed to touch on its own — nothing else in the frontmatter, and never the body.

How `/docs-update` uses them: `lib/scripts/scan-spec-freshness.sh` reads `linked_commit`, `last_updated` and `depends_on` to build a cheap, deterministic candidate list with no LLM involved; `clerk` then reads that list plus the actual diffs and decides, per candidate, whether it's real drift or noise — writing its verdict back into `freshness_check` and a one-line reason in its own report. See `harnesses/claude/skills/docs-update/SKILL.md` for the full flow.

## Links between notes

Reference other notes in the same SDD with a relative Markdown link, by the note's untranslated file name. Links out of the SDD (a source file, a URL) are ordinary links too. A module can change the style; follow it when one is active.

## Emphasis

Give closed decisions and open risks their own labelled paragraph (`**Decision:**`, `**Open:**`, `**Careful:**`) instead of burying them in prose. Use it where it earns attention; a document where everything is labelled has no emphasis at all.

## Structure that stays navigable

- **One subject per note.** A note about three things can't be linked to precisely.
- **Link generously between related notes.**
- **An index note per folder** that grows past a handful of files, linking its contents. That keeps a split document navigable (see `naming.md`).
- **Headings in a real hierarchy**: `##` under `#`, no jumping levels.

## Tables and code

- Tables for things that are genuinely tabular. A table with one column is a list.
- Code blocks always get a language tag — it's syntax highlighting for a human and a type hint for an agent.
- Paths, commands and identifiers go in backticks, so they survive translation untouched.

## What not to do

- Don't bold whole paragraphs. Emphasis that covers everything emphasizes nothing.
- Don't nest lists more than two levels deep — past that, it wants to be sections.
- Don't paste a wall of output into a note. Link the file, or quote the few lines that matter.
