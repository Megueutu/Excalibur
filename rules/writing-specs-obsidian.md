# Writing specs for Obsidian

Every spec produced from `pipeline/spec-template.md` follows these conventions, so it can be read comfortably in an Obsidian vault (graph view, backlinks, properties, Templater).

## Frontmatter / Properties

Every `spec.md` starts with YAML frontmatter:

```yaml
---
status: in-progress   # in-progress | done | paused
project: <project-name>
task: <task-slug>
class: feature         # fix | feature | big-feature
created: YYYY-MM-DD
---
```

`status` and `class` are the fields most worth filtering/querying later (e.g. via Dataview, if the vault has the plugin) — keep them updated, not just at creation.

## Wikilinks

References to other notes in the same SDD destination (another spec, a decision note, a project context note) use `[[note-name]]`, not a relative markdown link (e.g. `[name](../path.md)`). That's what feeds Obsidian's graph view and backlinks.

Links outside the vault (e.g. to this Excalibur repository, to a code file) stay as normal markdown links — wikilinks are only between notes in the same vault.

## Vault structure

A project's SDD destination (see [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md)) follows:

```
<destination>/
  specs/
    <repo>/<task>/spec.md
  Templates/
    spec-template.md      copy of pipeline/spec-template.md, used by Templater/QuickAdd
```

The `Templates/` folder exists to allow creating a new spec from inside Obsidian itself ("Insert Template" command or QuickAdd), without depending on the AI agent to copy the template manually.

## Callouts

Sections that deserve visual emphasis use a callout instead of just a header:

- Closed decision: `> [!note] Decision`
- Blocking risk or open item: `> [!warning] Open`
- Something that already went wrong once and shouldn't repeat: `> [!danger] Careful`

Example:

```markdown
> [!warning] Open
> reasoning-chain override mechanism not yet tested on this project.
```
