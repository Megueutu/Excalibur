---
name: token-diet
description: Use to find what a project makes the agent read every session that does not earn its place. `/token-diet`. Not for trimming one prompt and not for editing the files.
---

# /token-diet

A thin wrapper over the `trimmer` subagent (`agents/trimmer/agent.yaml`).

## What to do

1. Dispatch `trimmer`. It measures with `excalibur budget --json` itself; no handoff is needed.
2. Show the total saving first, then the proposals, biggest first, each with its risk.
3. Do nothing to the files. If the person takes a proposal, make that one edit and run the budget again to show the real change.

## What this is not

Not a prompt rewriter and not an automatic cleaner. A cut that was never measured before and after is a guess.
