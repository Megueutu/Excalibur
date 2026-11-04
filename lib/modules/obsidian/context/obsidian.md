# Obsidian

This project's SDD destination is meant to be opened as an Obsidian vault. This overrides the link and emphasis style of `rules/writing-md.md`.

- Follow `lib/modules/obsidian/rules/writing-md.md` of the installed package: `[[wikilinks]]` between notes, callouts for closed decisions and open risks.
- Keep `project.canvas` at the root of the SDD destination current. After a task, the `review` agent walks `lib/modules/obsidian/rules/canvas-update-checklist.yaml` and updates the matching nodes. Create it with `excalibur canvas`.
- Never translate wikilink targets or callout types.
- Do not rely on any plugin being installed: everything is plain Markdown and plain JSON.
