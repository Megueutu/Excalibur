# rules/

Rules the framework ships into a project. Everything here ends up under `.excalibur/rules/` when a project is onboarded, and is read by agents at work time.

Rules **about this repository** are not here — they live in [`../docs/repo/`](../docs/repo/). Keeping them apart matters, because this folder gets copied into other people's projects.

| File | What it is |
|---|---|
| [`global/`](global/) | KISS, YAGNI, DRY, SOLID — apply to every project regardless of stack |
| [`stacks/`](stacks/) | Per-language / per-framework / per-IDE recommendations, combinable |
| [`md-size-limits.yaml`](md-size-limits.yaml) | Allowlist of file types that do have a size limit, and what it is |
| [`tasks-ordering.yaml`](tasks-ordering.yaml) | Fixed heuristic for numbering task checklists |
| [`canvas-update-checklist.yaml`](canvas-update-checklist.yaml) | What the review agent checks before updating the project canvas |
| [`naming.md`](naming.md) | File naming and dating conventions |
| [`interaction.md`](interaction.md) | How agents phrase questions to the user |
| [`writing-md-obsidian.md`](writing-md-obsidian.md) | Markdown conventions so the SDD reads well in Obsidian |
| [`prompt-cache.md`](prompt-cache.md) | Where the stable prefix ends and cache breakpoints go |
| [`translation.md`](translation.md) | What gets translated and what never does |

## YAML vs. Markdown here

Short, structured, enumerable content is YAML — one file per domain, parseable without interpreting prose. Anything that is genuinely reasoning stays Markdown. Consolidating prose into YAML moves complexity around instead of removing it.
