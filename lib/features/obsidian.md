# Obsidian integration

This project's SDD destination is meant to be opened as an Obsidian vault.

- Every `.md` file under the SDD destination follows `rules/writing-md-obsidian.md`
  — frontmatter, `[[wikilinks]]` between notes, and callouts (`> [!note]`,
  `> [!warning]`, `> [!danger]`) for decisions and open risks.
- `project.canvas` at the root of the SDD destination is a JSON Canvas file (open
  format, plain JSON) — open it in Obsidian for a spatial view of the project.
  It's kept current by the `review` agent; regenerate it on demand with
  `excalibur canvas`.
- Don't rely on any Obsidian plugin being installed — everything here is plain
  Markdown and plain JSON, readable with or without the app.
