# Bootstrap — creating the SDD for a new project

Runs once per project, before any implementation task (`pipeline/entrypoint.md`) can start. Triggered by the harness adapter in use (see `harnesses/<harness>/`) when it doesn't find an SDD destination already configured for the project (see "Detection" below).

## 1. Check detection first

Before asking anything, confirm the project doesn't already have an SDD destination (see "Detection" below). If it does, stop — don't re-run onboarding on top of an existing destination.

## 2. Ask: adapt an existing project or start from scratch?

- **Adapt existing**: the project already has code, possibly already has some documentation/process — read what exists (`README.md`, `CONTRIBUTING.md`, etc.) before proposing the structure, instead of just overwriting it.
- **From scratch**: new project or one with no defined process yet — go straight to step 3.

## 3. Ask every question in `manifest.yaml`, in order

Read [`bootstrap/manifest.yaml`](manifest.yaml). For each entry in `questions`, ask its `prompt` using its `options`' `label`s verbatim — don't invent a question that isn't in the manifest, don't skip one that is. For the `language` question, try inferring the answer from the language the user is using in this conversation before asking explicitly.

## 4. Resolve answers into a copy-list file

For each answered question, look at the chosen option in the manifest:
- If it has a `copy` block, add one `source<TAB>dest` line (using `copy.source` and `copy.dest` verbatim) to a temporary copy-list file. `copy.source` is relative to `bootstrap/` (matching `init.sh`'s contract — see its header), not the Excalibur root.
- If it has no `copy` block and no `translate` flag (e.g. `destination`, `review_depth: standard`, or `github_preset: custom`), it contributes no line — `destination` only decides the target path in step 5, and `custom` means the user's free text becomes `git.md` directly, without going through the copy list.
- If it has `translate: true` (the `language: other` option), don't add a copy-list line — remember to run step 6 after step 5.

## 5. Run the script

```bash
bootstrap/init.sh <embedded|separate> <target-path> [project-name] [copy-list-file]
```

This creates the destination structure (specs/, Templates/, reflection/) and copies every pair from the copy-list file on top of the two files it always copies (`pipeline/spec-template.md`, `reflection/when-to-pause.md`) — see the full contract in `init.sh`'s header. If `github_preset` was answered `custom`, write the user's free text to `git.md` in the destination yourself, after the script runs.

In embedded mode there is no `project-name` slot: pass `""` as the 3rd argument if you also need to pass a 4th argument (`copy-list-file`) — `bootstrap/init.sh embedded <target-path> "" <copy-list-file>`. Passing anything non-empty as the 3rd argument in embedded mode is an error.

## 6. Translate, only if `language` was answered `other`

Invoke the `translator` subagent (see `harnesses/claude/agents/translator.md` for the Claude adapter) against the destination's `Templates/` and `reflection/` folders, with the language resolved in step 3. This runs exactly once, right after step 5 — never automatically again later.

The root-level process/convention files the manifest-driven copies produce (`git.md`, `commit-convention.md`, `review-checklist-override.md`) intentionally stay in English and are not passed to the translator — they encode fixed keywords that other docs reference.

## 7. After running it

Go straight to [`pipeline/entrypoint.md`](../pipeline/entrypoint.md) with the project's first real task — bootstrap only prepares the destination, it doesn't implement anything.

## Detection (for harness adapters)

Before triggering this wizard, check whether the project already has an SDD destination:
1. Does `.sdd/` exist at the root of the project's repo? → already bootstrapped, embedded mode.
2. Does `../<repo-name>-sdd/` exist (sibling folder of the repo)? → already bootstrapped, separate mode.
3. Neither → trigger this wizard.
