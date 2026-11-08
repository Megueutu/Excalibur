---
name: blast-radius
description: Use before changing, renaming, moving or deleting something shared, to map what depends on it. `/blast-radius <thing>`. Not for making the change.
---

# /blast-radius

A thin wrapper over the `surveyor` subagent (`agents/surveyor/agent.yaml`).

## What to do

1. Dispatch `surveyor` with the target the person named, as written, plus what they intend to do with it (rename, delete, change the shape).
2. Show the counts and the direct dependents first, then the **Not covered** list. The last one is the part that prevents a bad surprise; do not trim it.
3. Make no change. The map informs the decision; it does not take it.
