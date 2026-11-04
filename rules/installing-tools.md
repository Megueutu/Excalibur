# Installing a tool the work needs

Applies whenever a task needs a tool that is not available yet: an indexer, a formatter, a test runner, a helper of any kind. Environments differ too much for fixed commands, so this file gives the method and never a command. Stack-specific knowledge belongs in `rules/stacks/`, as data.

## Before touching anything

1. **Check it is really missing.** Look for it the way the project would run it. It may already be installed, vendored, or provided by the project's own tooling.
2. **Look at the environment instead of assuming it.** Which operating system, which package managers and runtimes are already present, and which one the project already uses to manage its dependencies.
3. **Read the tool's current official instructions.** Commands, package names and options change; what you remember may be stale. Confirm the exact name and publisher, because lookalike names exist. If you cannot confirm the source, stop and ask.

## Choose the narrowest scope that works

From most to least preferred:

1. **Project-local and reversible:** through the mechanism the project already uses, or an isolated environment inside the project.
2. **User-level:** isolated from the project and from the system, removable in one step.
3. **System-wide or global configuration:** only with the user's consent, every time.

A helper tool does not justify adding a dependency to the project's own manifest, nor changing the user's global settings, shell or hooks. If the only way in is a wider scope than the task needs, say so and let the user choose.

## Consent follows the project's autonomy answer

- `always_ask` and `skip_on_fix`: show the exact command and what it will change (files, global configuration, hooks, network access), then wait.
- `autonomous`: proceed alone only for project-local, reversible installs. Anything wider still asks.
- Never run a downloaded script you have not read. Never supply credentials for an installer.

## After

1. **Verify** with a harmless command that proves the tool runs, not just that the install exited cleanly.
2. **Record** what was installed, from where, at which scope and why, with the `decision-log` skill when that module is on.
3. **Say how to undo it.** If you cannot, the install was wider than it should have been.

## When the environment does not fit

No suitable package manager, no network, a locked-down machine, or a tool that needs a runtime the project does not have: stop and report what is missing and the options. Do not improvise around the restriction.
