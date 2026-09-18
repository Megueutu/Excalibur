# Purpose of Excalibur

Excalibur is a support repository for development with SDD (spec-driven development) — it's not product code, it's where the *process* of how to implement things in other repos lives, plus the project-specific context for each project worked on.

It exists to solve two problems:

1. **Keeping AI-assisted planning out of product repos.** Specs, interviews (grillme), analyses, and design decisions must not leave a trail in the history of the repos being worked on — they live in the SDD destination that `bootstrap/` creates for each project (embedded `.sdd/` or a separate `<repo>-sdd/`), never here in Excalibur.
2. **Not tying the process to a single harness.** The methodology (grillme → classify → spec → checklist) is the same regardless of whether it runs on Claude, Codex, Cursor, or another agent — only the way it's triggered changes per harness.

## What it is NOT

- It's not where project code lives — each project stays in its own repository.
- It's not where the specs themselves live — that's in each project's SDD destination (see `bootstrap/entrypoint.md`); only the process and shared context live here.
- It's not pure markdown — besides the process documentation, there's `bootstrap/init.sh`, a small bash script that materializes a project's SDD destination.
- It's not specific to one organization — the structure needs to support any new project without rework. `projects/solaria/` is a legacy leftover being phased out (see "Legacy" in [structure.md](structure.md)), not the normal case.

See [structure.md](structure.md) for how this translates into folders.
