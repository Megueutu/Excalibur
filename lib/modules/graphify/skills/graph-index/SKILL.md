---
name: graph-index
description: Use when the material to work from is too large to read - many long documents, many files, a whole repository. Builds a graph index to find where things are; the facts still come from the original files.
---

# Graph index

A graph index is a map of a large body of material: what it contains and how the pieces relate. It tells you **where to look**. It is never the source of a fact.

## When to use it

- The material is too large to read in full: many long documents, many files, a whole repository.
- The question is "where is this?" or "what relates to this?" across many places.

## When not to

- A handful of files. Read them directly; building the index costs more than it saves.
- Instructions the project already tells you where to find.
- Anything where you would be tempted to quote the index instead of the original.

## How

1. Build the index in a scratch folder that is not versioned. Never commit it.
2. Use it to find candidate locations, then open the original file at that location.
3. Record every fact with its origin in the original, exactly as it appears there. Do not record a fact because the index says so.
4. If the index and the original disagree, the original wins. Say so, and rebuild the index.
5. Rebuild after the material changes. A stale index is worse than none.

## Does it pay off?

Nobody has shown that it does for every kind of work, so measure before making it a habit. Follow [ab-protocol.md](ab-protocol.md) and fill in [ab-results-template.md](ab-results-template.md). Keep the module only if the results justify it.
