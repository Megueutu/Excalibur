# Contributing to Excalibur

Thanks for helping improve Excalibur. Keep each contribution focused, preserve the separation between framework content and harness adapters, and document behavior that changes how users work with the CLI.

## Before you start

Read the repository documentation that applies to your change:

- [`docs/repo/purpose.md`](docs/repo/purpose.md) explains the project's goals.
- [`docs/repo/structure.md`](docs/repo/structure.md) explains where each kind of change belongs.
- [`docs/repo/git.md`](docs/repo/git.md) is the source of truth for commit conventions.

The shared methodology belongs in `lib/`, `rules/`, or `reflection/`. Harness-specific integration belongs in `harnesses/`. Avoid duplicating shared content inside the npm packages.

## Local setup

Clone your fork and install the package dependencies:

```bash
npm install
```

Make a focused change and validate the affected commands. Before opening a pull request, also check the package contents:

```bash
npm pack --dry-run
```

## Commit messages

Every commit must use this pattern:

```text
type: message
```

Commit messages must be entirely lowercase and written in English. Do not use a parenthesized scope. Keep one logical change per commit.

Examples:

```text
feat: add codex harness adapter
fix: resolve sdd path after directory rename
docs: explain package installation
```

These are invalid:

```text
feat(cli): add command
Feature: add command
fix: Corrigir caminho do sdd
```

Allowed types follow Conventional Commits: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, and `revert`.

## Pull requests

- Keep the pull request limited to one clear purpose.
- Explain the behavior that changed and why.
- Include the validation you ran.
- Update documentation when commands, configuration, package contents, or user-facing behavior change.
- Do not commit generated dependencies, local caches, or generated harness files.

Maintainers may ask for a contribution to be split when it contains unrelated changes.
