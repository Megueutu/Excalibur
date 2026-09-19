# wizard/

One-time onboarding for a project. Runs before any implementation task can start, and never runs again on a project that already has an SDD destination.

| File | What it is |
|---|---|
| [`entrypoint.md`](entrypoint.md) | The flow the agent follows, step by step |
| [`manifest.yaml`](manifest.yaml) | Every question asked during onboarding, with fixed options and a default per question |
| [`init.sh`](init.sh) | Materializes the SDD destination — `embedded`, `separate` or `external` |
| [`onboarding/`](onboarding/) | Pre-written files copied into the destination based on the answers |
| [`scripts/`](scripts/) | Shell helpers for git/GitHub, OS and stack detection — see [`scripts/README.md`](scripts/README.md) |

## Two ways in

Onboarding can be reached from either direction, and they converge:

1. **Terminal first** — `npx excalibur init` runs the structured form and writes `.excalibur-answers.yaml`. Then `/excalibur-init` in the harness finds that file and skips straight to materialization.
2. **Chat first** — `/excalibur-init` with no pre-collected answers asks everything conversationally.

Either way, the agent keeps probing on top of the answers before running `init.sh` — that part is always conversational (see step 5 of [`entrypoint.md`](entrypoint.md)).
