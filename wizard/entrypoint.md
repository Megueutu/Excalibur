# Wizard — creating the SDD for a new project

Runs once per project, before any implementation task (`lib/pipeline/entrypoint.md`) can start. Triggered by the harness adapter in use (see `harnesses/<harness>/`) when it doesn't find an SDD destination already configured, or explicitly by `/excalibur-init`.

## 0. Check for pre-collected answers

If `.excalibur-answers.yaml` exists at the root of the target project, the user already ran `npx excalibur init` and answered the form in the terminal. Read it, skip steps 3 and 4, and go straight to step 5 (the interpreter still runs — the form collects, it doesn't decide).

If it doesn't exist, this is the conversational path: ask everything here.

## 1. Check detection first

Before asking anything, confirm the project doesn't already have an SDD destination (see "Detection" below). If it does, stop — don't re-run onboarding on top of an existing destination.

## 2. Detect and configure git/GitHub

A context-gathering and setup step, not a manifest-driven question — it uses the scripts under [`lib/scripts/`](scripts/) directly. It stays outside the CLI form on purpose: `gh auth login` is an interactive OAuth flow that can't be driven from a non-interactive collection script.

a. Run [`lib/scripts/check-gh.sh`](scripts/check-gh.sh).
   - Installed and authenticated → note it and continue.
   - Not installed → ask the user: "Install GitHub CLI (`gh`) now?"
     - Yes → run [`lib/scripts/detect-os.sh`](scripts/detect-os.sh) and run the matching installer (`install-gh-windows.sh`, `install-gh-macos.sh`, `install-gh-linux-apt.sh`, or `install-gh-linux-dnf.sh`) from the same folder, then re-run `check-gh.sh` to confirm.
     - No → note "manual git workflow: no `gh`, PRs opened via a browser link, no automated repo creation" and continue.
   - Installed but not authenticated → tell the user to run `gh auth login` themselves; continue treating this the same as "not installed" for the rest of this step until they confirm.

b. Run [`lib/scripts/check-git-repo.sh`](scripts/check-git-repo.sh) `<target-path>`.
   - Already a git repository → continue.
   - Not a git repository → ask whether to initialize one; if yes, run [`lib/scripts/init-git-repo.sh`](scripts/init-git-repo.sh) `<target-path>`.
   - If no → note that the SDD destination is still created, but there's nothing versioning the project itself.

c. Repository creation is **not** decided here — it's part of the `destination` question in step 4, whose `new_repo` option unifies "create the repo from scratch" with "choose where the SDD lives". If that option is chosen, come back and run [`lib/scripts/create-github-repo.sh`](scripts/create-github-repo.sh) `<target-path> <name> <public|private>` during step 6, immediately followed by [`lib/scripts/setup-new-repo.sh`](scripts/setup-new-repo.sh) `<target-path> <name> <github_preset>` to apply base repo config and the preset-specific setup (ruleset + PR template for `conservative`, none for `direct`/`custom`).

## 3. Ask: adapt an existing project or start from scratch?

Context-gathering, not a manifest question. It shapes how you read the project before the questions start.

- **Adapt existing**: the project already has code and possibly a process — read what exists (`README.md`, `CONTRIBUTING.md`, an `AGENTS.md` if there is one) before proposing structure, instead of overwriting it. `AGENTS.md` is an external market convention: Excalibur reads it, never creates or owns it.
- **From scratch**: go straight to step 4.

## 4. Ask the manifest questions

Read [`wizard/manifest.yaml`](manifest.yaml).

**First, ask the `master` question**: customize, or use the defaults?

- **Defaults** → don't ask the rest one by one. Resolve every question to its `default` and move on. Say which defaults were applied, in one compact block, so the choice stays visible.
- **Customize** → ask each entry in `questions`, in order, using its `prompt` and its options' `label`s verbatim. Don't invent a question that isn't in the manifest; don't skip one that is.

For `language`, try inferring from the conversation and from the target project's `README.md` before asking outright. For an option marked `free_text: true`, the user's own words are the answer.

## 5. Interpret the answers as a whole

This step runs on both paths — pre-collected form and conversation alike. It is a step of this flow, not a dedicated agent: it's a stage in the wizard, not a role reused elsewhere in the pipeline.

Read the full set of answers together and look for combinations that raise questions the individual questions couldn't:

1. Collect every `review_hint` attached to a chosen option. Each one is an explicit "dig into this" instruction written by whoever authored the question — follow them all before continuing.
2. Look for combinations that don't sit well together, and ask about them. A monorepo with no CI and case-by-case testing raises different concerns than a library with strict review and mandatory tests.
3. Ask follow-ups in the `P:` / `R:` format (see `rules/interaction.md`) — one question at a time, isolated, not buried in prose.

Do not invent new configuration here. This step resolves ambiguity in what was answered; it doesn't add settings that don't exist in the manifest.

## 6. Resolve answers into a copy list

For each answered question, look at the chosen option:

- Has a `copy` block → add one `source<TAB>dest` line (values verbatim) to a temporary copy-list file. `copy.source` is relative to `wizard/`, matching `init.sh`'s contract — not to the Excalibur root.
- Has `free_text: true` → the user's text becomes the destination file directly, written by you after the script runs. It doesn't go through the copy list.
- Has neither, and no `translate` flag → contributes nothing. `destination` only decides the target path; `review_depth: standard` deliberately has no override file.
- Has `translate: true` → no copy-list line; remember to run step 8.

## 7. Run the script

```bash
wizard/init.sh embedded <target-path> ""             [copy-list-file]
wizard/init.sh separate <target-path> <project-name> [copy-list-file]
wizard/init.sh external <target-path> <sdd-path>     [copy-list-file]
```

This creates the destination structure (`specs/`, `ideas/`, `architecture/`, `Templates/`, `reflection/`) and copies every pair from the copy list on top of the files it always copies. Full contract in `init.sh`'s header.

For `destination: external`, the path comes from step 5 — `~/.excalibur/projects/<name>/` is the predefined offer, and the user can type their own. For `destination: new_repo`, create the repository first (step 2c), then run the script against the new repo with the layout confirmed in step 5.

If `github_preset` was answered `custom`, write the user's free text to `git.md` in the destination yourself, after the script runs.

If `obsidian_vault` was answered `vault`, run [`lib/scripts/scaffold-obsidian-vault.sh`](scripts/scaffold-obsidian-vault.sh) `<sdd-destination-path>` right after `init.sh` finishes, to materialize a minimal `.obsidian/` config folder.

## 8. Translate, only if `language` was answered `other`

Invoke the `translator` subagent (see [`lib/agents/translator.yaml`](../lib/agents/translator.yaml)) against the destination's `Templates/` and `reflection/` folders, with the resolved language.

What gets translated is decided structurally, by where a file sits — not by a list of exceptions. See `rules/translation.md`: the **visible SDD** (`ideas/`, `architecture/`, `proposal.md`, `spec.md`, `design.md`, canvas) is translated; the **operational Excalibur** (`.excalibur/`, `lib/pipeline/`, `rules/`, `tasks.yaml`, `history.yaml`) never is. The point is token economy: no agent should spend tokens translating a file no human will read.

Unlike the original one-shot behavior, this applies continuously — documents written later follow the same language.

## 9. Write the config and finish

Write the `Excalibur` file (root, no extension, YAML content) with the resolved answers, so later sessions don't have to re-derive them. If the CLI ran `init`, it already did this — verify rather than overwrite.

Then go straight to [`lib/pipeline/entrypoint.md`](../lib/pipeline/entrypoint.md) with the project's first real task — the wizard only prepares the destination, it doesn't implement anything.

## Detection (for harness adapters)

Before triggering this wizard, check whether the project already has an SDD destination:

1. Is there an `Excalibur` config file at the root? → onboarded; it names the destination.
2. Does `.sdd/` exist at the repo root? → onboarded, embedded mode.
3. Does `../<repo-name>-sdd/` exist? → onboarded, separate mode.
4. None of the above → trigger this wizard.

External destinations are only discoverable through the `Excalibur` file, which is why check 1 comes first.
