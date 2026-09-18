# Repository structure

```
Excalibur/
  rules/            rules about Excalibur itself (this file and its neighbors)
  pipeline/          implementation methodology, harness-agnostic and project-agnostic
  reflection/         reasoning chain and rules for when to pause/ask
  bootstrap/          onboarding wizard: creates a new project's SDD destination
  harnesses/
    <harness>/         thin harness adapter — just "when to trigger" + pointer to the rest
  projects/
    solaria/.contexto/   Solaria's legacy context — do not use as a reference for a new project, see note below
```

## Layers and where each thing lives

| Layer | Where | Rule for deciding if something belongs here |
|---|---|---|
| `rules/` | root | Rules about how to use/maintain Excalibur itself, including how to write skills, specs (Obsidian), and scripts. |
| `pipeline/` | root | Implementation process assuming the project's SDD already exists (grillme, classification, spec, checklist). |
| `reflection/` | root | How to think when producing a spec — standard reasoning chain and when to pause/ask. Not "what to do", but "how to decide". |
| `bootstrap/` | root | New-project onboarding — runs once, decides where the project's SDD will live. |
| `harnesses/<harness>/` | root | Just the adapter (trigger + pointer). Never duplicate content from `pipeline/`/`reflection/`/`bootstrap/`. |
| `projects/` | root | **Legacy.** Projects no longer live inside Excalibur — `bootstrap/` materializes their SDD embedded in the project's own repo or in a separate repo. `projects/solaria/` stays here until migrated (future task). |

## Why the methodology was split into `pipeline/` and `reflection/`

`pipeline/` is process sequence ("first grillme, then classify, then spec"). `reflection/` is about how to think at each step of that sequence ("which reasoning chain to follow when writing the spec", "when is this decision too big to make alone") — different enough concerns that they shouldn't live in the same place.

See [adding-a-harness.md](adding-a-harness.md) for how to extend the harness layer. New-project onboarding is now [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md), no longer a file in `rules/`.
