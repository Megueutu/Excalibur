# History cleanup — local hook

Cleanup is reactive: it fires alongside your own use of Excalibur, with no schedule to configure.

## Setup

In `.claude/settings.json`, on the `Stop` event (end of a task) rather than `PostToolUse`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "npx excalibur clean-history --quiet --if-stale" }
        ]
      }
    ]
  }
}
```

`--if-stale` makes the command a no-op unless the last prune is older than the configured interval, so the hook stays cheap even though it fires often.

## Why `Stop` and not `PostToolUse`

`PostToolUse` fires after *every* tool call — dozens of times per task. Even a cheap no-op adds up, and pruning history halfway through a task can remove an entry the task is still appending to. `Stop` fires once, when the work is done.

## What it does

Entries older than the cutoff are removed from version control **and** archived locally in `history/archive/` (gitignored).
