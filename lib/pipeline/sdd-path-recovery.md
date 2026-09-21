# SDD path recovery

What to do when the SDD destination can't be found where the config says it is — a
renamed folder, a moved folder, or a config that predates `sdd_path` entirely.

Triggered by `magic-book` (and any other step that needs to locate the SDD) before
giving up and asking the user from scratch. Read this file when `sdd_path` is missing,
or when the path it names no longer exists.

## Why this exists

`sdd_path` in the root `Excalibur` config is the literal resolved path to the SDD
destination — the thing to read first, instead of re-deriving it from the `destination`
mode (`embedded`/`separate`/`external`/`new_repo`) and guessing a folder name. Guessing
breaks the moment someone renames `.sdd/` to `docs/` or `sdd-notes/`. This procedure is
the fallback for exactly that.

## The flow

1. **Read `sdd_path` from the `Excalibur` config.** If it's set and the path exists,
   that's the SDD destination — stop here, nothing to recover.

2. **If the path is missing or no longer exists, scan for the marker instead of
   guessing by name.** Every SDD destination has a hidden, empty
   `.excalibur-sdd-marker` file inside it, dropped there when the destination was
   materialized (see `excalibur/src/commands/init.js` / `excalibur/src/lib/config.js`
   for `embedded`/`separate`, and `create-excalibur/onboarding/init.sh` for whichever
   step materializes `external`/`new_repo`). List first-level folders at the project root and check each
   one for that marker. Don't shortcut this by looking for a folder that merely looks
   like `.sdd` or `<repo>-sdd` — the whole point of the marker is that the name is no
   longer trustworthy.

3. **Found elsewhere — auto-correct and keep going.** Update `sdd_path` in the
   `Excalibur` config to the folder that actually has the marker, and log a short note
   about the correction (old path, new path, when). This is **not** a `history.yaml`
   entry — `history.yaml` is per-task execution history, and this is a framework-level
   self-correction that isn't about any one task. A one-line note wherever the session
   already surfaces framework notices is enough. Don't block the current task on this;
   correct the config and continue with what the user actually asked for.

4. **Not found anywhere — ask once, then stop asking.** If no first-level folder has
   the marker, ask the user where the SDD went, exactly once. Update `sdd_path` with
   their answer (and write the marker into that folder if it's missing one, so the next
   recovery doesn't need to ask again). Never keep guessing indefinitely, and never
   silently fall back to creating a brand-new SDD destination — that would orphan
   whatever specs and architecture notes already exist.

## What this deliberately doesn't do

- It doesn't scan recursively. First-level folders under the project root only — the
  SDD destination is never nested deep, and a recursive scan over a large repo is
  exactly the kind of unbounded search this procedure exists to avoid.
- It doesn't run on every session. It's a recovery path, invoked when `sdd_path` is
  absent or stale, not a standing check.
