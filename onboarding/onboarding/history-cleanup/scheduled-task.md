# History cleanup — Claude Code scheduled task

Cleanup runs on a schedule managed by Claude Code itself. No git host involved, no CI, nothing to configure outside the harness.

## Setup

Create a scheduled task that runs, from the project root:

```bash
npx excalibur clean-history
```

Weekly is a reasonable starting cadence — history grows per task, not per hour.

## What it does

Entries older than the cutoff are removed from version control **and** archived locally in `history/archive/` (gitignored). Not deleted outright, not versioned forever.

## Why this is the simplest option

It doesn't depend on where the repository is hosted, and it doesn't fire on every tool call the way a hook does. If you already use Claude Code's scheduled tasks for anything else, this costs nothing extra.
