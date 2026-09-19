# Writing markdown for Obsidian

Applies to **every** `.md` in the SDD destination, not only specs. The SDD isn't just instructions for an agent — it's the project's living documentation, and a human has to be able to navigate it.

Excalibur only guarantees the content reads well *if* opened in Obsidian. It does not create or manage an `.obsidian/` config folder — installing and configuring the app is the user's business. (The `obsidian_vault` question can opt into config generation; the default is markdown only.)

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
