---
name: scenthound-scan
description: Use before pushing a change, to sniff the diff for security problems — hardcoded secrets, injection-shaped patterns, unsafe deserialization — and get a plain verdict back. `/scenthound-scan`. Not for style or correctness review, and not for fixing what it finds.
---

# /scenthound-scan

A thin wrapper over the `scenthound` subagent (`lib/agents/scenthound.yaml`). The caller doesn't need to know a full agent runs behind it — just that this command sniffs before a push and hands back a verdict.

## What to do

1. Dispatch the `scenthound` subagent against the current diff (or the working tree, if there's nothing to diff against yet). It has no context beyond what it reads itself — no handoff needed, just point it at what to scan.
2. Surface its verdict first, plainly: `approved`, `attention`, or `blocked`.
3. Surface its structured findings underneath — file, line, pattern, why it matters — so `attention` or `blocked` is actionable without a second pass.

## After the verdict

- **`approved`** — nothing to do; proceed with the push.
- **`attention`** — say what it is, let the human decide whether to proceed anyway.
- **`blocked`** — don't push. If the human wants to override, that's their call to make explicitly, not something this skill decides for them.

## What this is not

Not a full security audit (`security-review` is the tool for that) and not a fixer — a `blocked` verdict says what's wrong, it doesn't patch it. Whoever owns the code fixes it and runs the scan again.
