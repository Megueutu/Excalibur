# Naming and dating conventions

Applies to every file the framework or its agents create in the SDD destination.

## Dated vs. living

| Kind | Format | Examples |
|---|---|---|
| **A moment in time** — written once, about a specific point | `YYYY-MM-DD-title.md` | `2026-09-18-auth-rewrite-plan.md`, `2026-09-18-scribe.md` (a handoff) |
| **Living** — continuously updated, always current | `title.md`, no date | `roadmap.md`, `stack.md`, `code-standards.md` |

The distinction is whether the file has a "true as of" date. A plan written in September is a September artifact even when read in March. A roadmap is only ever about now — dating it implies a version history the file doesn't have.

ISO order (`YYYY-MM-DD`) because it sorts chronologically as text, in every tool, with no configuration.

## Never number a filename

`roadmap-1.md`, `roadmap-2.md`, `roadmap-3.md` is the failure this convention exists to prevent. A numbered suffix is a naming decision deferred: it carries no information about what's inside, and by the fourth file nobody knows which one holds what.

When a document outgrows itself, **split it by subject**:

```
architecture/
  roadmap.md                  index, links the pieces
  roadmap-q3-migration.md
  roadmap-billing.md
```

Each name says what's in the file. The index links them, which also makes the split visible in Obsidian's graph instead of leaving three orphan notes.

Whether the index stays in the original file or becomes a new one is **not** a global rule — it depends on that directory's convention. See `md-size-limits.yaml`.

## Slugs

Lowercase, hyphen-separated, no accents: `auth-rewrite`, not `Auth_Rewrite` or `autenticação`. Filenames end up in URLs, in wikilinks and on filesystems with different case behavior; a slug that survives all three is worth the small loss of expressiveness.

A task's slug is the folder name under `specs/<repo>/` and is what its wikilinks point at. Renaming it later breaks every link to it, so pick it when the task is understood, not on first mention.

## Folders

| Folder | Holds |
|---|---|
| `specs/<repo>/<task-slug>/` | The five files of one task |
| `ideas/` | Thinking not yet formalized |
| `architecture/` | Living knowledge about how the project is built |
| `Templates/` | Copies used by Obsidian's template tools |
| `reflection/` | How to reason while producing a spec |

`architecture/` is split by subject, never by size: `stack.md`, `auth-flow.md`, `deploy.md` — not `architecture-1.md`.
