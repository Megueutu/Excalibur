# Prompt caching — where the stable prefix ends

This is about Anthropic's actual prompt caching feature (`cache_control`), not a metaphor for organizing context. With an orchestrator plus handoffs plus implementation plus review, the same prefix gets re-sent many times per task, and that's the cost worth attacking.

## The technical facts that shape the design

- **`cache_control: {type: "ephemeral"}` marks the end of a cacheable prefix.** Everything from the start of the request up to that block becomes a cache candidate. It is positional: the prefix must be byte-for-byte identical between calls to hit.
- **Minimum ~1024 tokens** for a block to be worth caching. Small prefixes don't pay off.
- **Maximum 4 breakpoints per request.** This is the constraint that actually forces a design — you can't just mark everything, you have to pick up to four cut points.
- **Reading from cache costs ~10% of normal input.** The initial write costs a bit more (~1.25x for 5 minutes, ~2x for 1 hour). It pays off from the second reuse of the same prefix within the window.
- **Lifetime under a Pro/Max subscription is 1 hour by default**, renewed on each use. It drops to 5 minutes only when consuming extra usage credits, or when access is through an API key or a cloud provider directly (where 1 hour is opt-in).

Since Excalibur's audience is mostly individual developers and small teams on a Claude Code subscription, the real slack between handoffs is much larger than a raw API reading would suggest.

## The order, stable first

```
1. rules/global/        KISS, YAGNI, DRY, SOLID      — identical across all projects
2. rules/stacks/*       the project's stack files     — changes only if the stack changes
3. architecture/        living project knowledge      — changes across weeks
4. the task's spec + handoff                          — changes every call
```

Breakpoints go after 1, after 2 and after 3. **Level 4 always stays outside the cache** — it's the part that differs on every call, and including it would invalidate everything before it.

That's three breakpoints, leaving one spare. Spend it on a fourth stable layer if a project has one (a large shared `design-system.md`, say) — not on splitting an existing level finer.

## Don't cache everything, everywhere

The goal isn't maximum coverage. It's making sure the sessions that are **already known to be expensive** have a well-defined stable prefix and calls close enough together in time:

- Many handoffs between orchestrator and agents
- Large specs
- Projects with a big `architecture/`

A quick Fix with a single agent doesn't need any of this. Setting up caching for it costs more attention than it saves.

`/usage` and the status line's `prompt_cache` fields show local cost and cache behavior without any extra API call — that's how you find which sessions are the expensive ones instead of guessing.

## What breaks a cache hit, in practice

- Anything that varies inside the prefix: a timestamp, a session id, a re-ordered list.
- Reading architecture files in a different order between calls.
- Interleaving task-specific content into a stable level — a single spec quote inside the rules block invalidates the whole prefix.

`/magic-book` loads exactly these stable levels, in this order, which is why using it consistently also helps the cache hit.
