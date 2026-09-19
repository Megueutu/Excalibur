# harnesses/

Thin adapters, one per harness. Today only [`claude/`](claude/) exists and is functional.

An adapter never contains methodology — only:

1. when to trigger (that harness's native mechanism), and
2. a pointer to `pipeline/entrypoint.md` and to the project's own rules.

If an adapter starts explaining the process instead of pointing at it, it has grown too big: move the content back to `pipeline/` if it's generic, or to the project's SDD destination if it's specific.

See [`../docs/repo/adding-a-harness.md`](../docs/repo/adding-a-harness.md) for how to build a new one.
