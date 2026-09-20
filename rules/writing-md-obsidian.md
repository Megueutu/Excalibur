# Writing markdown for Obsidian

Applies to **every** `.md` in the SDD destination, not only specs. The SDD isn't just instructions for an agent — it's the project's living documentation, and a human has to be able to navigate it.

Excalibur only guarantees the content reads well *if* opened in Obsidian. It does not create or manage an `.obsidian/` config folder — installing and configuring the app is the user's business. (The `obsidian_vault` question can opt into config generation; the default is markdown only.)

## Two categories of markdown, and only one of them is this file's business

Excalibur's repository contains two very different kinds of `.md`, and this file governs exactly one of them:

- **Visible SDD** — `specs/`, `architecture/`, `ideas/`, the Canvas: everything written to the SDD destination inside a target project. It is translated to the project's own language, it is meant for a human to read and collaborate on, and it lives in a vault a person actually opens. This is what every rule below applies to.
- **Operational Excalibur** — `.excalibur/`, `lib/pipeline/`, `rules/` themselves, `wizard/`, `harnesses/`. Fixed English, agent-only consumption. This category is **excluded on purpose, not by accident of where the files happen to sit.** Nobody browses `lib/agents/orchestrator.yaml` in Obsidian looking for backlinks — it's content an agent reads to know how to behave, not a note a person walks through. Frontmatter shaped for Dataview queries, wikilinks that feed a graph view, callouts sized for visual scanning — none of that serves a file whose only reader is a model executing it as instructions.

If you're editing something under `lib/pipeline/`, `rules/`, `wizard/`, `harnesses/`, or `.excalibur/`, this file's conventions do not apply to it. Its own house style (YAML frontmatter for agents/skills, plain Markdown headings, no wikilinks, English-only) is set by the files already there — see `lib/agents/review.yaml` or `harnesses/claude/skills/try-gh/SKILL.md` for the pattern to follow instead.

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

`status` and `class` are what you'll actually want to filter on later (via Dataview, if the vault has it). Keep them current — a file left at `in-progress` forever makes every query useless.

Keys stay in English even when the project's language isn't: they're queried, not read.

## Anti-spec-drift frontmatter

`spec.md` (see `lib/pipeline/spec-template.md`) carries a second, separate block of frontmatter fields on top of `status`/`project`/`task`/`class`/`created` above. These exist so drift between a spec and the code it describes can be detected mechanically instead of discovered by accident:

| Field | Meaning |
|---|---|
| `spec_id` | Stable identifier for the spec — the task slug, unless the project has a different convention. What `depends_on` on other specs points at. |
| `status` | `draft \| in_progress \| blocked \| done \| obsolete` — the spec's own lifecycle, independent of `freshness_check` below. A `done` spec can still go stale later. |
| `last_updated` | Date the spec's content was last genuinely revised — not touched, revised. Bumped by whoever edits the spec. |
| `linked_commit` | The commit the spec was last verified against. `wizard/scripts/scan-spec-freshness.sh` diffs from here forward. |
| `linked_release` | Optional. A tag/release this spec's described behavior shipped in — omit until it actually has. |
| `depends_on` | List of other `spec_id`s this one assumes are still true. If one of those goes stale, this one is a candidate too. |
| `freshness_check` | `ok \| stale \| pending` — the last verdict from the drift pipeline. `pending` until the pipeline has run at least once. |

Who writes what: a human or `spec-writer` sets `spec_id`, `status` and `depends_on` when the spec is written or revised, and bumps `last_updated`/`linked_commit` on a genuine revision. `freshness_check` is the one field `docs-updater` (`lib/agents/docs-updater.yaml`) is allowed to touch on its own — nothing else in the frontmatter, and never the body.

How `/docs-update` uses them: `wizard/scripts/scan-spec-freshness.sh` reads `linked_commit`, `last_updated` and `depends_on` to build a cheap, deterministic candidate list with no LLM involved; `docs-updater` then reads that list plus the actual diffs and decides, per candidate, whether it's real drift or noise — writing its verdict back into `freshness_check` and a one-line reason in its own report. See `harnesses/claude/skills/docs-update/SKILL.md` for the full flow.

## Wikilinks

References to other notes in the same vault use `[[note-name]]`, not a relative markdown link. This is what feeds the graph view and backlinks — a relative link renders fine and leaves the note an orphan in the graph.

Links **out** of the vault (to this repository, to a source file, to a URL) stay normal markdown links. Wikilinks are for notes in the same vault only.

Wikilink targets are never translated — they point at a file by its untranslated name.

## Callouts

Sections that deserve visual weight get a callout instead of just a heading:

- Closed decision: `> [!note] Decision`
- Blocking risk or open question: `> [!warning] Open`
- Something that already went wrong once and must not repeat: `> [!danger] Careful`

```markdown
> [!warning] Open
> Whether the rate limit applies per user or per token.
```

Use them where they earn attention. A document where every section is a callout has no emphasis at all.

## Structure that reads well in a graph

- **One subject per note.** A note about three things can't be linked to precisely, and shows up as a hub that means nothing.
- **Link generously between related notes** — the graph is only as useful as the links in it.
- **An index note per folder** that grows past a handful of files, linking its contents. That's what keeps a split document navigable (see `naming.md`).
- **Headings in a real hierarchy** — `##` under `#`, no jumping levels. The outline view is a navigation tool, not decoration.

## Tables and code

- Tables for things that are genuinely tabular. A table with one column is a list.
- Code blocks always get a language tag — it's syntax highlighting for a human and a type hint for an agent.
- Paths, commands and identifiers go in backticks, so they survive translation untouched.

## What not to do

- Don't bold whole paragraphs. Emphasis that covers everything emphasizes nothing.
- Don't nest lists more than two levels deep — past that, it wants to be sections.
- Don't paste a wall of output into a note. Link the file, or quote the few lines that matter.
