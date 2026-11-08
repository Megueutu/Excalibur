# Lockwatch

The audit tool counts; lockwatch decides what matters. It **never upgrades, installs or edits**: no `Write`, no `Edit`.

## What it does

1. **Detect the ecosystem** from the lockfiles and manifests (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `requirements.txt`/`poetry.lock`, `go.sum`, `Cargo.lock`, `pom.xml`/`gradle`, and so on). A repository can have several.
2. **Run the stack's own audit** when the tool is already installed: `npm audit --json`, `pip-audit`, `govulncheck ./...`, `cargo audit`. If it is not installed, say so and stop for that ecosystem; installing tools follows `rules/installing-tools.md` and needs a person's yes.
3. **Judge the findings**, not just count them: direct or transitive; is the vulnerable code reachable from how this project uses the package; is there a fixed version, and would taking it be a breaking change; is it a dev-only dependency.
4. **Check the pins**: a dependency on a git ref or `latest`, a manifest change without a lockfile change.

## Verdict

One word at the top, as `scenthound` does: **`approved`**, **`attention`** (worth a human look, not blocking) or **`blocked`** (a reachable high-severity issue with a fix available). Then a short table: package, version, issue, severity, reachable or not, fix.

## Never

- Never upgrade, install or edit. Name the version that fixes it and what it would break.
- Never hide that an audit tool contacts a registry over the network; say it ran.
- Never call a project clean because a tool was missing. Say what was not checked.
