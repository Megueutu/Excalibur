# Prompt caching — where the stable prefix ends

This is about the provider feature that lets a repeated prompt prefix be read back cheaply, not about organizing context in the abstract. With an orchestrator, handoffs, implementation and review, the same prefix is sent many times per task, and that repetition is the cost worth attacking.

## Numbers live elsewhere

Prices, minimum sizes, lifetimes and the number of cut points change by provider and over time. This file states only the principles that survive those changes. For the current figures, read the provider's own documentation before relying on any number, and treat anything remembered from earlier as unverified.

## What stays true

- **A cached prefix is positional.** Everything from the start of the request up to a marked cut point is a candidate, and it must be identical, byte for byte, between calls to be reused.
- **Cut points are scarce.** Providers cap how many a request may mark, so the design must choose where they go instead of marking everything.
- **Reading is cheaper than writing.** The first call pays a premium to store the prefix; the saving starts at the first reuse inside the window.
- **Entries expire, and use renews them.** Calls that are too far apart pay the write cost again. Mixing different lifetimes in one request can be rejected, so keep one per request.
- **Small prefixes do not pay off.** Below a minimum size the provider may not cache at all.
- **Automatic caching, where offered, uses one of the same scarce cut points.** Count it when planning.

## The order, stable first

```
1. rules/global/        general principles           — identical across all projects
2. rules/stacks/*       the project's stack files     — changes only if the stack changes
3. architecture/        living project knowledge      — changes across weeks
4. the task's spec + handoff                          — changes every call
```

Cut points go after 1, after 2 and after 3. **Level 4 always stays outside the cache**: it differs on every call, and including it would invalidate everything before it.

If the provider allows a further cut point, spend it on another stable layer (a large shared design document, say), not on splitting an existing level finer.

## Don't cache everything, everywhere

The goal is not maximum coverage. It is making sure the sessions already known to be expensive have a well-defined stable prefix and calls close enough together in time:

- Many handoffs between orchestrator and agents
- Large specs
- Projects with a big `architecture/`

A quick fix with a single agent needs none of this; setting up caching for it costs more attention than it saves.

`excalibur budget` estimates how much context a task starts with, and the harness's own usage view shows real cost and cache behavior. Use them to find the expensive sessions instead of guessing.

## What breaks a cache hit, in practice

- Anything that varies inside the prefix: a timestamp, a session id, a re-ordered list.
- Reading architecture files in a different order between calls.
- Interleaving task-specific content into a stable level: a single spec quote inside the rules block invalidates the whole prefix.

`/magic-book` loads exactly these stable levels, in this order, which is why using it consistently also helps the cache hit.
