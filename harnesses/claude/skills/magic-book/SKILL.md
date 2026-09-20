---
name: magic-book
description: Use at the start of a fresh session on an Excalibur project, when the session needs the project's context loaded — architecture, config and rules — instead of the user re-explaining everything or writing a context file by hand. Invoked manually; not something to run automatically on every session.
---

# Magic book

Loads the project's SDD context into a new session, in a fixed order, cheaply.

The problem it solves: you open a new session and the agent knows nothing. Either you re-explain the project, or you keep a hand-written context file up to date forever. Both are work you already did once.

## Manual invocation only

This is deliberately **not** wired to a hook that fires on every session. Plenty of sessions don't need the full context — a quick question, a one-line fix — and loading it anyway is spending tokens on nothing. Same reasoning as history not being read by default.

## What to load, in this order

The order is the point. It is the stable-prefix order from `rules/prompt-cache.md`, so running this consistently also makes the prompt cache hit:

1. **`Excalibur`** (root config) — destination, language, autonomy, testing policy, the answers that shape everything else. Small, and it tells you where the rest lives. Read `sdd_path` from it to find the SDD destination directly, rather than re-deriving it from the `destination` mode. If that path doesn't exist, follow [`lib/pipeline/sdd-path-recovery.md`](../../../../lib/pipeline/sdd-path-recovery.md) before giving up on step 4.
2. **`rules/global/`** — KISS, YAGNI, DRY, SOLID. Identical across every project, so it's the most cacheable thing there is.
3. **`rules/stacks/`** — only the files matching this project's stack answers. Not the whole folder.
4. **`architecture/`** — the project's living knowledge, from the SDD destination. Read the index first; read individual files when they're relevant.

Stop there. Do **not** load:

- `specs/` — task-specific, and there may be dozens. Load one when working on it.
- `history.yaml` — not read by default, on purpose (it's bias, not context).
- `ideas/` — thinking in progress, not established fact.

## Report back briefly

A short summary of what the project is, what stack it uses, and what the active conventions are. Not a recitation of the files — the user knows their own project; they need to know what *you* now know.

If `architecture/` is empty or missing, say so plainly. An empty architecture folder is a real finding: it means the project's knowledge only exists in people's heads, and the next session will start from zero again.

## Cost

Everything here is a file read, in a fixed order, with no exploration. Reading the same stable prefix in the same order across sessions is what lets the cache serve it at roughly a tenth of the input cost.
