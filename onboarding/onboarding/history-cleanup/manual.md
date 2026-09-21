# History cleanup — manual

No automation. Run it when you feel like it:

```bash
npx @spec/excalibur clean-history
```

## What it does

The default criterion is combined, not either/or: entries older than the cutoff are **removed from version control and archived locally** in `history/archive/`, which is gitignored. Nothing is deleted outright, and nothing stays versioned forever.

## When this option makes sense

Small projects, or anyone who'd rather see the result before it happens. Since the command is the same one every other option calls underneath, switching to an automated option later changes only *when* it runs, never *what* it does.
