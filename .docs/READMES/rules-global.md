# rules/global/

Principles that apply to every project regardless of stack. Read by agents at work time; no tooling installs them.

| File | What it is |
|---|---|
| [`kiss.md`](kiss.md) | Keep It Simple |
| [`yagni.md`](yagni.md) | You Aren't Gonna Need It |
| [`dry.md`](dry.md) | Don't Repeat Yourself |
| [`solid.md`](solid.md) | The five SOLID principles, as an umbrella |

## Why these are documents, not linters

They're design principles, not mechanically verifiable rules. A linter that claims to enforce SOLID mostly produces false positives — "this class has too many methods" is not the same finding as "this class has more than one reason to change". Forcing them through tooling would generate noise an agent then has to learn to ignore, which is worse than no check at all.

Per-stack recommendations are different: a TypeScript linter checks real, decidable things. Those live in [`../stacks/`](../stacks/) and do come with install scripts.

## Under `strict-rules`

When the session sets the `strict-rules` flag, a violation of these fails the task rather than being noted in the report. That's the only setting that changes how they're applied.
