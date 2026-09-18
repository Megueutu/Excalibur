# Bootstrap — creating the SDD for a new project

Runs once per project, before any implementation task (`pipeline/entrypoint.md`) can start. Triggered by the harness adapter in use (see `harnesses/<harness>/`) when it doesn't find an SDD destination already configured for the project (see "Detection" below).

## 1. Ask: adapt an existing project or start from scratch?

- **Adapt existing**: the project already has code, possibly already has some documentation/process — read what exists (`README.md`, `CONTRIBUTING.md`, etc.) before proposing the structure, instead of just overwriting it.
- **From scratch**: new project or one with no defined process yet — go straight to question 2.

## 2. Ask: where should the SDD be materialized?

| Option | Where it lives | When it makes sense |
|---|---|---|
| **Embedded** | `.sdd/` at the root of the project's own repo | Team already OK with AI-assisted planning being version-tracked alongside the code. |
| **Separate** | Sibling repo `<repo-name>-sdd`, outside the project's repo | Wants to keep the product repo's history free of AI artifacts (see the principle in `code-standards.md`, when it exists for the project). |

## 3. GitHub preset

Ask how to handle git/GitHub on this project:
- **Option A** — [`presets/github/conservative.md`](presets/github/conservative.md): never merge alone, always PR.
- **Option B** — [`presets/github/direct.md`](presets/github/direct.md): push directly to the branch, PR only if asked.
- **Option C — Specify**: user describes the rules in free text; that text becomes `git.md` in the destination, instead of a preset.

## 4. Run the script

With the three answers in hand, call:

```bash
bootstrap/init.sh <embedded|separate> <target-path> [project-name]
```

This creates the destination structure (specs/, Templates/, reflection/), copies spec-template.md into Templates/ and when-to-pause.md into reflection/, and prints a message asking you to manually copy the chosen GitHub preset as `git.md` — see the full script contract in `init.sh`'s header.

## 5. After running it

Go straight to [`pipeline/entrypoint.md`](../pipeline/entrypoint.md) with the project's first real task — bootstrap only prepares the destination, it doesn't implement anything.

## Detection (for harness adapters)

Before triggering this wizard, check whether the project already has an SDD destination:
1. Does `.sdd/` exist at the root of the project's repo? → already bootstrapped, embedded mode.
2. Does `../<repo-name>-sdd/` exist (sibling folder of the repo)? → already bootstrapped, separate mode.
3. Neither → trigger this wizard.
