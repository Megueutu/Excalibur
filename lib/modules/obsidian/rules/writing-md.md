# Writing notes for Obsidian

Applies to every `.md` in the SDD destination while the `obsidian` module is on. It adds to `rules/writing-md.md`; where the two differ, this file wins.

Excalibur only guarantees the content reads well *if* opened in Obsidian. It does not manage the app. A minimal `.obsidian/` config folder can be created with `scripts/scaffold-vault.sh` when the project asks for it.

## Wikilinks

References to other notes in the same vault use `[[note-name]]`, not a relative Markdown link. This is what feeds the graph view and backlinks: a relative link renders fine and leaves the note an orphan in the graph.

Links **out** of the vault (a source file, a URL) stay normal Markdown links. Wikilink targets are never translated: they point at a file by its untranslated name.

## Callouts

Sections that deserve visual weight get a callout instead of just a heading:

- Closed decision: `> [!note] Decision`
- Blocking risk or open question: `> [!warning] Open`
- Something that already went wrong once and must not repeat: `> [!danger] Careful`

```markdown
> [!warning] Open
> Whether the rate limit applies per user or per token.
```

Callout types are never translated. Use them where they earn attention.

## Structure that reads well in a graph

- One subject per note, so it links precisely and is not a hub that means nothing.
- Link generously between related notes: the graph is only as useful as its links.
- An index note per folder once it grows past a handful of files.
- Headings in a real hierarchy: the outline view is a navigation tool.

## Frontmatter queries

`status` and `class` are the fields worth filtering on, if the vault has a query plugin. Keep them current. Do not depend on any plugin being installed.

## The project canvas

`project.canvas` at the root of the SDD destination is a JSON Canvas file (open format, plain JSON), so it is written directly like any other file, with no need to drive the app.

- There is **one canvas for the project as a whole**: a macro view, not one per task.
- An idea may also get a canvas when that specific idea benefits from being seen spatially. That is a judgment call per idea.
- The `review` agent keeps the project canvas current by walking `rules/canvas-update-checklist.yaml` of this module: a short list of "did X change?" questions, and for each one that changed, the matching node is updated. Checking a fixed list is cheap; re-deriving the whole canvas every time is not.
- `excalibur canvas` creates it from `templates/project-canvas.canvas`, or resets it to the blank template.
